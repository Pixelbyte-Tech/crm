export interface TradingAccountSchemaDeletedDto {
  /** The schema id */
  schemaId: string;
  /** The timestamp in (UTC millisecond timestamp) */
  deletedAt: number;
}
