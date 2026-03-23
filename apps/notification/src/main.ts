import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { useContainer } from 'class-validator';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transport, KafkaOptions } from '@nestjs/microservices';

import { HttpExceptionFilter } from '@crm/http';
import { EcsLogger, RestLogInterceptor } from '@crm/logger';
import { SwaggerModule, SwaggerService } from '@crm/swagger';

import { AppModule } from './app.module';
import { AppConfig } from './config/app/app-config.type';
// Initialise Sentry instrumentation
import './insturment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set the app module as the service container (required for class-validator)
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Get configuration service
  const config = app.get(ConfigService<{ app: AppConfig }>);

  // Set logger
  const isDev = 'development' === config.get('app.nodeEnv', { infer: true });
  app.useLogger(isDev ? ['debug'] : new EcsLogger());

  // Set global prefix for all routes
  app.setGlobalPrefix('api', { exclude: ['/'] });

  // Register global pipes
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Register global interceptors
  app.useGlobalInterceptors(new RestLogInterceptor());

  // Register global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Attach a kafka broker microservice (if needed)
  // This microservice within nest is only needed if you want to consume messages from kafka topics
  app.connectMicroservice<KafkaOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: config
          .getOrThrow('app.kafkaBrokers', { infer: true })
          .split(',')
          .map((i: string) => i.trim()),
        clientId: config.getOrThrow('app.appName', { infer: true }),
        retry: { retries: 20 },
      },
      consumer: {
        groupId: config.getOrThrow('app.appName', { infer: true }),
        allowAutoTopicCreation: true,
      },
    },
  });

  // Start Kafka consumer microservice
  await app.startAllMicroservices();

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  // Prepare the Swagger Docs
  app.select(SwaggerModule).get(SwaggerService).setup(app);

  // Start the application
  await app.listen(3000);
  Logger.log(`API listening on: http://localhost:3005/docs#/`);
}

bootstrap().then().catch(console.error);
