import { ApiExcludeController } from '@nestjs/swagger';
import { Logger, Inject, Controller } from '@nestjs/common';
import { Ctx, Payload, ClientKafka, EventPattern, KafkaContext } from '@nestjs/microservices';

import { KafkaDlq, UserEmailUpdatedEvent } from '@crm/kafka';

import { NotificationService } from './services';

@Controller()
@ApiExcludeController()
export class KafkaController {
  constructor(
    @Inject('KAFKA') private readonly kafka: ClientKafka, // Required by @KafkaDlq
    private readonly notificationService: NotificationService,
  ) {}

  /** The logger instance for this class */
  readonly #logger = new Logger(this.constructor.name);

  /**
   * Listens for the event based on the pattern and records an audit trail
   * @param e The event
   * @param context The kafka context
   */
  @KafkaDlq({ topic: UserEmailUpdatedEvent.type })
  @EventPattern([UserEmailUpdatedEvent.type, `${UserEmailUpdatedEvent.type}.retry`])
  async onUserCreated(@Payload() e: UserEmailUpdatedEvent, @Ctx() context: KafkaContext): Promise<void> {
    const msg = `Received ${UserEmailUpdatedEvent.name} for '${e.data?.id ?? 'n/a'}'`;
    this.#logger.log(`${msg}`);

    await this.notificationService.scheduleConfirmEmail({ email: e.data.newEmail });
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
