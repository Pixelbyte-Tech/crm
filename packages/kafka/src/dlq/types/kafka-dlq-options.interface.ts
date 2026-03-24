export interface KafkaDlqOptions {
  /** The kafka topic the decorator is wrapping */
  topic: string;
  /** Maximum number of retry attempts before sending to DLQ (default: 3) */
  maxRetries?: number;
  /** Name of the injected Kafka client property (default: 'KAFKA') */
  kafkaClientProperty?: string;
}
