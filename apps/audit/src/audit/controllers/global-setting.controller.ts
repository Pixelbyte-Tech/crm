import { DateTime } from 'luxon';
import { ApiExcludeController } from '@nestjs/swagger';
import { Logger, Inject, Controller } from '@nestjs/common';
import { Ctx, Payload, ClientKafka, EventPattern, KafkaContext } from '@nestjs/microservices';

import { AuditAction, AuditResult, AuditTarget } from '@crm/types';
import { KafkaDlq, GlobalSettingCreatedEvent, GlobalSettingUpdatedEvent, GlobalSettingDeletedEvent } from '@crm/kafka';

import { AuditService } from '../services';

@Controller()
@ApiExcludeController()
export class GlobalSettingController {
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
  @KafkaDlq({ topic: GlobalSettingCreatedEvent.type })
  @EventPattern([GlobalSettingCreatedEvent.type, `${GlobalSettingCreatedEvent.type}.retry`])
  async onUserCreated(@Payload() e: GlobalSettingCreatedEvent, @Ctx() context: KafkaContext): Promise<void> {
    const msg = `Received ${GlobalSettingCreatedEvent.name} for '${e.data?.setting.id ?? 'n/a'}'`;
    this.#logger.log(`${msg}`);

    await this.auditService.persist(
      {
        eventId: e.id,
        targetAction: AuditAction.CREATED,
        targetType: AuditTarget.SETTING,
        targetId: e.data.setting.id,
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
  @KafkaDlq({ topic: GlobalSettingUpdatedEvent.type })
  @EventPattern([GlobalSettingUpdatedEvent.type, `${GlobalSettingUpdatedEvent.type}.retry`])
  async onUserUpdated(@Payload() e: GlobalSettingUpdatedEvent, @Ctx() context: KafkaContext): Promise<void> {
    const msg = `Received ${GlobalSettingUpdatedEvent.name} for '${e.data?.setting.id ?? 'n/a'}'`;
    this.#logger.log(`${msg}`);

    await this.auditService.persist(
      {
        eventId: e.id,
        targetAction: AuditAction.UPDATED,
        targetType: AuditTarget.SETTING,
        targetId: e.data.setting.id,
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
  @KafkaDlq({ topic: GlobalSettingDeletedEvent.type })
  @EventPattern([GlobalSettingDeletedEvent.type, `${GlobalSettingDeletedEvent.type}.retry`])
  async onUserDeleted(@Payload() e: GlobalSettingDeletedEvent, @Ctx() context: KafkaContext): Promise<void> {
    const msg = `Received ${GlobalSettingDeletedEvent.name} for '${e.data?.settingId ?? 'n/a'}'`;
    this.#logger.log(`${msg}`);

    await this.auditService.persist(
      {
        eventId: e.id,
        targetAction: AuditAction.DELETED,
        targetType: AuditTarget.SETTING,
        targetId: e.data.settingId,
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
