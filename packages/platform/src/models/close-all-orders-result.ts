export class CancelAllOrdersResult {
  /** The list of order ids that were closed */
  ordersClosed: string[];

  /** True if all orders were closed successfully */
  ordersStatus: boolean;

  constructor(data: CancelAllOrdersResult) {
    this.ordersClosed = data.ordersClosed;
    this.ordersStatus = data.ordersStatus;
  }
}
