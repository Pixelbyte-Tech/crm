import { DateTime } from 'luxon';
import { ApiExcludeController } from '@nestjs/swagger';
import { Logger, Inject, Controller } from '@nestjs/common';
import { Ctx, Payload, ClientKafka, EventPattern, KafkaContext } from '@nestjs/microservices';

import { AuditAction, AuditResult, AuditTarget } from '@crm/types';
import { KafkaDlq, ServerCreatedEvent, ServerUpdatedEvent, ServerDeletedEvent } from '@crm/kafka';

import { AuditService } from '../services';

@Controller()
@ApiExcludeController()
export class ServerController {
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
  @KafkaDlq({ topic: ServerCreatedEvent.type })
  @EventPattern([ServerCreatedEvent.type, `${ServerCreatedEvent.type}.retry`])
  async onUserCreated(@Payload() e: ServerCreatedEvent, @Ctx() context: KafkaContext): Promise<void> {
    const msg = `Received ${ServerCreatedEvent.name} for '${e.data?.serverId ?? 'n/a'}'`;
    this.#logger.log(`${msg}`);

    await this.auditService.persist(
      {
        eventId: e.id,
        targetAction: AuditAction.CREATED,
        targetType: AuditTarget.SERVER,
        targetId: e.data.serverId,
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
  @KafkaDlq({ topic: ServerUpdatedEvent.type })
  @EventPattern([ServerUpdatedEvent.type, `${ServerUpdatedEvent.type}.retry`])
  async onUserUpdated(@Payload() e: ServerUpdatedEvent, @Ctx() context: KafkaContext): Promise<void> {
    const msg = `Received ${ServerUpdatedEvent.name} for '${e.data?.serverId ?? 'n/a'}'`;
    this.#logger.log(`${msg}`);

    await this.auditService.persist(
      {
        eventId: e.id,
        targetAction: AuditAction.UPDATED,
        targetType: AuditTarget.SERVER,
        targetId: e.data.serverId,
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
  @KafkaDlq({ topic: ServerDeletedEvent.type })
  @EventPattern([ServerDeletedEvent.type, `${ServerDeletedEvent.type}.retry`])
  async onUserDeleted(@Payload() e: ServerDeletedEvent, @Ctx() context: KafkaContext): Promise<void> {
    const msg = `Received ${ServerDeletedEvent.name} for '${e.data?.serverId ?? 'n/a'}'`;
    this.#logger.log(`${msg}`);

    await this.auditService.persist(
      {
        eventId: e.id,
        targetAction: AuditAction.DELETED,
        targetType: AuditTarget.SERVER,
        targetId: e.data.serverId,
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
