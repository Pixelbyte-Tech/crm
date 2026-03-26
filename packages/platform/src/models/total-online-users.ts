export class TotalOnlineUsers {
  /** The server details */
  server: { url: string };

  /** The total number of online users */
  totalOnlineUsers: number;

  constructor(data: TotalOnlineUsers) {
    this.server = data.server;
    this.totalOnlineUsers = data.totalOnlineUsers || 0;
  }
}
