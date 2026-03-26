import { ClosePositionResult } from './close-position-result';

export class CloseAllTradesResult {
  /** The list of position ids that were closed */
  positionsClosed: string[];

  /** True if all positions were closed successfully */
  positionsStatus: boolean;

  /** The list of close position results */
  positionsResults: ClosePositionResult[];

  /** The list of order ids that were closed */
  ordersClosed: string[];

  /** True if all orders were closed successfully */
  ordersStatus: boolean;

  constructor(data: CloseAllTradesResult) {
    this.positionsClosed = data.positionsClosed;
    this.positionsStatus = data.positionsStatus;
    this.positionsResults = data.positionsResults;
    this.ordersClosed = data.ordersClosed;
    this.ordersStatus = data.ordersStatus;
  }
}
