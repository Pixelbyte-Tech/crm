import { DateTime } from 'luxon';
import { ApiExcludeController } from '@nestjs/swagger';
import { Logger, Inject, Controller } from '@nestjs/common';
import { Ctx, Payload, ClientKafka, EventPattern, KafkaContext } from '@nestjs/microservices';

import { AuditAction, AuditResult, AuditTarget } from '@crm/types';
import {
  KafkaDlq,
  PlatformClientCreatedEvent,
  PlatformClientUpdatedEvent,
  PlatformClientDeletedEvent,
} from '@crm/kafka';

import { AuditService } from '../services';

@Controller()
@ApiExcludeController()
export class PlatformClientController {
  constructor(
    @Inject('KAFKA') private readonly kafka: ClientKafka, // Required by @KafkaDlq
    private readonly auditService: AuditService,
  ) {}

  /** The logger instance for this class */
  readonly #logger = new Logger(this.constructor.name);

  /**
   * Listens for the event based on the pattern and records an audit trail
   * @param e The event
   * @param context The kafka context
   */
  @KafkaDlq({ topic: PlatformClientCreatedEvent.type })
  @EventPattern([PlatformClientCreatedEvent.type, `${PlatformClientCreatedEvent.type}.retry`])
  async onUserCreated(@Payload() e: PlatformClientCreatedEvent, @Ctx() context: KafkaContext): Promise<void> {
    const msg = `Received ${PlatformClientCreatedEvent.name} for '${e.data?.clientId ?? 'n/a'}'`;
    this.#logger.log(`${msg}`);

    await this.auditService.persist(
      {
        eventId: e.id,
        targetAction: AuditAction.CREATED,
        targetType: AuditTarget.PLATFORM_CLIENT,
        targetId: e.data.clientId,
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
  @KafkaDlq({ topic: PlatformClientUpdatedEvent.type })
  @EventPattern([PlatformClientUpdatedEvent.type, `${PlatformClientUpdatedEvent.type}.retry`])
  async onUserUpdated(@Payload() e: PlatformClientUpdatedEvent, @Ctx() context: KafkaContext): Promise<void> {
    const msg = `Received ${PlatformClientUpdatedEvent.name} for '${e.data?.clientId ?? 'n/a'}'`;
    this.#logger.log(`${msg}`);

    await this.auditService.persist(
      {
        eventId: e.id,
        targetAction: AuditAction.UPDATED,
        targetType: AuditTarget.PLATFORM_CLIENT,
        targetId: e.data.clientId,
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
  @KafkaDlq({ topic: PlatformClientDeletedEvent.type })
  @EventPattern([PlatformClientDeletedEvent.type, `${PlatformClientDeletedEvent.type}.retry`])
  async onUserDeleted(@Payload() e: PlatformClientDeletedEvent, @Ctx() context: KafkaContext): Promise<void> {
    const msg = `Received ${PlatformClientDeletedEvent.name} for '${e.data?.clientId ?? 'n/a'}'`;
    this.#logger.log(`${msg}`);

    await this.auditService.persist(
      {
        eventId: e.id,
        targetAction: AuditAction.DELETED,
        targetType: AuditTarget.PLATFORM_CLIENT,
        targetId: e.data.clientId,
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
