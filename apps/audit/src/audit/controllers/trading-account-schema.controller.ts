import { DateTime } from 'luxon';
import { ApiExcludeController } from '@nestjs/swagger';
import { Logger, Inject, Controller } from '@nestjs/common';
import { Ctx, Payload, ClientKafka, EventPattern, KafkaContext } from '@nestjs/microservices';

import { AuditAction, AuditResult, AuditTarget } from '@crm/types';
import {
  KafkaDlq,
  TradingAccountSchemaCreatedEvent,
  TradingAccountSchemaUpdatedEvent,
  TradingAccountSchemaDeletedEvent,
} from '@crm/kafka';

import { AuditService } from '../services';

@Controller()
@ApiExcludeController()
export class TradingAccountSchemaController {
  constructor(
    private readonly auditService: AuditService,
    @Inject('KAFKA') private readonly kafka: ClientKafka, // Required by @KafkaDlq
  ) {}

  /** The logger instance for this class */
  readonly #logger = new Logger(this.constructor.name);

  /**
   * Listens for the event based on the pattern and records an audit trail
   * @param e The event
   * @param context The kafka context
   */
  @KafkaDlq({ topic: TradingAccountSchemaCreatedEvent.type })
  @EventPattern([TradingAccountSchemaCreatedEvent.type, `${TradingAccountSchemaCreatedEvent.type}.retry`])
  async onUserCreated(@Payload() e: TradingAccountSchemaCreatedEvent, @Ctx() context: KafkaContext): Promise<void> {
    const msg = `Received ${TradingAccountSchemaCreatedEvent.name} for '${e.data?.schemaId ?? 'n/a'}'`;
    this.#logger.log(`${msg}`);

    await this.auditService.persist(
      {
        eventId: e.id,
        targetAction: AuditAction.CREATED,
        targetType: AuditTarget.TRADING_ACCOUNT_SCHEMA,
        targetId: e.data.schemaId,
        result: AuditResult.SUCCESS,
        occurredAt: DateTime.fromMillis(e.data.createdAt).toJSDate(),
      },
      e.metadata,
    );

    await this.#commitNextOffset(context);
  }

  /**
   * Listens for the event based on the pattern and records an audit trail
   * @param e The event
   * @param context The kafka context
   */
  @KafkaDlq({ topic: TradingAccountSchemaUpdatedEvent.type })
  @EventPattern([TradingAccountSchemaUpdatedEvent.type, `${TradingAccountSchemaUpdatedEvent.type}.retry`])
  async onUserUpdated(@Payload() e: TradingAccountSchemaUpdatedEvent, @Ctx() context: KafkaContext): Promise<void> {
    const msg = `Received ${TradingAccountSchemaUpdatedEvent.name} for '${e.data?.schemaId ?? 'n/a'}'`;
    this.#logger.log(`${msg}`);

    await this.auditService.persist(
      {
        eventId: e.id,
        targetAction: AuditAction.UPDATED,
        targetType: AuditTarget.TRADING_ACCOUNT_SCHEMA,
        targetId: e.data.schemaId,
        result: AuditResult.SUCCESS,
        occurredAt: DateTime.fromMillis(e.data.updatedAt).toJSDate(),
      },
      e.metadata,
    );

    await this.#commitNextOffset(context);
  }

  /**
   * Listens for the event based on the pattern and records an audit trail
   * @param e The event
   * @param context The kafka context
   */
  @KafkaDlq({ topic: TradingAccountSchemaDeletedEvent.type })
  @EventPattern([TradingAccountSchemaDeletedEvent.type, `${TradingAccountSchemaDeletedEvent.type}.retry`])
  async onUserDeleted(@Payload() e: TradingAccountSchemaDeletedEvent, @Ctx() context: KafkaContext): Promise<void> {
    const msg = `Received ${TradingAccountSchemaDeletedEvent.name} for '${e.data?.schemaId ?? 'n/a'}'`;
    this.#logger.log(`${msg}`);

    await this.auditService.persist(
      {
        eventId: e.id,
        targetAction: AuditAction.DELETED,
        targetType: AuditTarget.TRADING_ACCOUNT_SCHEMA,
        targetId: e.data.schemaId,
        result: AuditResult.SUCCESS,
        occurredAt: DateTime.fromMillis(e.data.deletedAt).toJSDate(),
      },
      e.metadata,
    );

    await this.#commitNextOffset(context);
  }

  /**
   * Commits the next offset for a given kafka context. The context provided must
   * contain the current message.
   * @param context The kafka context
   * @param offset The offset to commit (overrides the offset from the context)
   */
  async #commitNextOffset(context: KafkaContext, offset?: number): Promise<void> {
    await context.getConsumer().commitOffsets([
      {
        topic: context.getTopic(),
        partition: context.getPartition(),
        offset: offset ? `${offset}` : `${Number(context.getMessage().offset) + 1}`,
      },
    ]);
  }
}
