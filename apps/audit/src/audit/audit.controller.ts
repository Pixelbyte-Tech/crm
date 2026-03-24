import { DateTime } from 'luxon';
import { ApiExcludeController } from '@nestjs/swagger';
import { Logger, Inject, Controller } from '@nestjs/common';
import { Ctx, Payload, ClientKafka, EventPattern, KafkaContext } from '@nestjs/microservices';

import { AuditAction, AuditResult, AuditTarget } from '@crm/types';
import { KafkaDlq, UserCreatedEvent, UserDeletedEvent, UserUpdatedEvent } from '@crm/kafka';

import { AuditService } from './services/audit.service';

@Controller()
@ApiExcludeController()
export class AuditController {
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
  @KafkaDlq({ topic: UserCreatedEvent.type })
  @EventPattern([UserCreatedEvent.type, `${UserCreatedEvent.type}.retry`])
  async onUserCreated(@Payload() e: UserCreatedEvent, @Ctx() context: KafkaContext): Promise<void> {
    const msg = `Received ${UserCreatedEvent.name} for '${e.data?.user.id ?? 'n/a'}'`;
    this.#logger.log(`${msg}`);

    await this.auditService.persist(
      {
        targetAction: AuditAction.CREATED,
        targetType: AuditTarget.USER,
        targetId: e.data.user.id,
        result: AuditResult.SUCCESS,
        failureReason: undefined,
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
  @KafkaDlq({ topic: UserUpdatedEvent.type })
  @EventPattern([UserUpdatedEvent.type, `${UserUpdatedEvent.type}.retry`])
  async onUserUpdated(@Payload() e: UserUpdatedEvent, @Ctx() context: KafkaContext): Promise<void> {
    const msg = `Received ${UserUpdatedEvent.name} for '${e.data?.user.id ?? 'n/a'}'`;
    this.#logger.log(`${msg}`);

    await this.auditService.persist(
      {
        targetAction: AuditAction.CREATED,
        targetType: AuditTarget.USER,
        targetId: e.data.user.id,
        result: AuditResult.SUCCESS,
        failureReason: undefined,
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
  @KafkaDlq({ topic: UserDeletedEvent.type })
  @EventPattern([UserDeletedEvent.type, `${UserDeletedEvent.type}.retry`])
  async onUserDeleted(@Payload() e: UserDeletedEvent, @Ctx() context: KafkaContext): Promise<void> {
    const msg = `Received ${UserDeletedEvent.name} for '${e.data?.userId ?? 'n/a'}'`;
    this.#logger.log(`${msg}`);

    await this.auditService.persist(
      {
        targetAction: AuditAction.CREATED,
        targetType: AuditTarget.USER,
        targetId: e.data.userId,
        result: AuditResult.SUCCESS,
        failureReason: undefined,
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
