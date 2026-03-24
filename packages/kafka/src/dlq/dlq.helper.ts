import { Logger } from '@nestjs/common';
import { ClientKafka, KafkaContext } from '@nestjs/microservices';

import { KafkaDlqOptions } from './types';

interface KafkaHeaders {
  [key: string]: Buffer | string | (Buffer | string)[];
}

/**
 * Internal function to handle DLQ error logic
 */
export async function handleDlqError(
  error: Error,
  context: KafkaContext,
  options: KafkaDlqOptions,
  payload: unknown,
  instance: object,
  logger: Logger,
): Promise<void> {
  const message = context.getMessage();
  const headers = (message.headers || {}) as KafkaHeaders;

  // Set defaults
  const maxRetries = options.maxRetries ?? 10;
  const kafkaClientProperty = options.kafkaClientProperty ?? 'kafka';

  // Get retry count from headers
  const retryCount = headers['x-retry-count'] ? parseInt(headers['x-retry-count'].toString(), 10) : 0;

  // Log the failure
  const msg = `Processing '${options.topic}' message failed (attempt ${retryCount + 1}/${maxRetries})`;
  logger.warn(msg, { topic: context.getTopic(), offset: message.offset, error });

  // Get the Kafka client from the instance
  const kafka: ClientKafka | undefined = instance[kafkaClientProperty];
  if (!kafka) {
    logger.error(`Could not find Kafka client at property '${kafkaClientProperty}', cannot re-process...`);
    throw error;
  }

  // Max retries exceeded - send to DLQ
  if (retryCount + 1 >= maxRetries) {
    sendToDLQ(context, kafka, options, payload, retryCount, error, logger);
    await commitOffset(context, logger);
    return;
  }

  // Send to retry queue
  sendToRetryQueue(context, kafka, options, payload, retryCount, logger);
  await commitOffset(context, logger);
}

/**
 * Send message to retry topic with incremented retry count
 */
function sendToRetryQueue(
  context: KafkaContext,
  kafka: ClientKafka,
  options: KafkaDlqOptions,
  payload: unknown,
  retryCount: number,
  logger: Logger,
): void {
  const message = context.getMessage();
  const headers = (message.headers || {}) as Record<string, any>;
  const retryTopic = `${options.topic}.retry`;

  // Increment retry count
  const newRetryCount = retryCount + 1;

  // Prepare the log message
  const msg = `Publishing message to retry topic '${retryTopic}'`;

  try {
    // Emit to retry topic with updated headers
    kafka.emit(retryTopic, {
      key: message.key?.toString(),
      value: payload,
      headers: {
        ...headers,
        'x-retry-count': newRetryCount.toString(),
        'x-original-topic': context.getTopic(),
        'x-original-partition': context.getPartition().toString(),
        'x-original-offset': message.offset,
        'x-retry-timestamp': Date.now().toString(),
      },
    });

    logger.log(`${msg} - Complete`);
  } catch (err) {
    logger.error(`${msg} - Failed`, err);
    throw err;
  }
}

/**
 * Send message to dead letter queue with error details
 */
function sendToDLQ(
  context: KafkaContext,
  kafka: ClientKafka,
  options: KafkaDlqOptions,
  payload: unknown,
  retryCount: number,
  error: Error,
  logger: Logger,
): void {
  const message = context.getMessage();
  const headers = (message.headers || {}) as Record<string, any>;
  const dlqTopic = `${options.topic}.dlq`;

  // Prepare the log message
  const msg = `Publishing message to DLQ '${dlqTopic}'`;

  try {
    // Send to DLQ with full context
    kafka.emit(dlqTopic, {
      key: message.key?.toString(),
      value: payload,
      headers: {
        ...headers,
        'x-retry-count': retryCount.toString(),
        'x-original-topic': context.getTopic(),
        'x-original-partition': context.getPartition().toString(),
        'x-original-offset': message.offset,
        'x-error-message': error.message,
        'x-error-stack': error.stack || '',
        'x-dlq-timestamp': Date.now().toString(),
      },
    });

    logger.warn(`${msg} - Complete`);
  } catch (err) {
    logger.error(`${msg} - Failed`, err);
    throw err;
  }
}

/**
 * Commit the offset for the current message
 * @param context The Kafka context
 * @param logger The logger to use for logging
 */
async function commitOffset(context: KafkaContext, logger: Logger): Promise<void> {
  const message = context.getMessage();
  const msg = `Committing offset ${Number(message.offset) + 1} for topic ${context.getTopic()}`;

  try {
    await context
      .getConsumer()
      .commitOffsets([
        { topic: context.getTopic(), partition: context.getPartition(), offset: `${Number(message.offset) + 1}` },
      ]);

    logger.log(`${msg} - Complete`);
  } catch (err) {
    logger.error(`${msg} - Failed`, err);
    throw err;
  }
}
