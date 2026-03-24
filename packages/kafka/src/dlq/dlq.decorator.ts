import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { KafkaContext } from '@nestjs/microservices';

import { KafkaDlqOptions } from './types';
import { handleDlqError } from './dlq.helper';

/**
 * Decorator to enable automatic Dead Letter Queue handling for Kafka event handlers.
 *
 * - Catches any errors thrown during message processing
 * - Tracks retry attempts using Kafka message headers
 * - Publishes failed messages to a retry topic (if retries remain)
 * - Publishes to DLQ topic after max retries exceeded
 * - Commits offsets so the consumer can move on to the next message
 */
export function KafkaDlq(options: KafkaDlqOptions) {
  const logger = new Logger('KafkaDlq');

  return function (_: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    // Store the original method
    const originalMethod = descriptor.value;

    // Ensure we have a valid method
    if (typeof originalMethod !== 'function') {
      logger.error(`KafkaDlq decorator can only be applied to methods, not to ${typeof originalMethod}`);
      return descriptor;
    }

    // Create the wrapped method
    const wrappedMethod = async function (...args: any[]) {
      // Extract Kafka context from arguments
      const context = args.find((arg) => arg?.getConsumer && arg?.getMessage) as KafkaContext | undefined;

      if (!context) {
        logger.error(`Could not find KafkaContext in method arguments for ${propertyKey}`);
        return originalMethod.apply(this, args);
      }

      // First argument is typically the @Payload()
      const payload = args[0];

      try {
        // Execute the original method
        return await originalMethod.apply(this, args);
      } catch (err) {
        // Handle the error with retry/DLQ logic
        await handleDlqError(err, context, options, payload, this, logger);
        return undefined;
      }
    };

    // Copy metadata from original method to wrapped method
    // This ensures NestJS decorators like @EventPattern still work correctly
    const metadataKeys = Reflect.getMetadataKeys?.(originalMethod) || [];
    metadataKeys.forEach((key) => {
      const metadata = Reflect.getMetadata(key, originalMethod);
      Reflect.defineMetadata(key, metadata, wrappedMethod);
    });

    // Copy function properties (name, length, etc.)
    Object.defineProperty(wrappedMethod, 'name', {
      value: originalMethod.name,
      writable: false,
    });

    // Replace the descriptor value with our wrapped method
    descriptor.value = wrappedMethod;

    // Return the modified descriptor
    return descriptor;
  };
}
