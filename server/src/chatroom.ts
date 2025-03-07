import WebSocket from "ws";

interface User {
  socket: WebSocket;
}

export class Chatroom {
  private users: User[];

  constructor() {
    this.users = [];
  }

  addUser(user: User) {
    this.users.push(user);
    this.addMessageHandler(user);
  }

  addMessageHandler(user: User) {
    user.socket.on("message", (data) => {
      const message = data.toString();

      this.broadcast(message);
    });
  }

  removeUser(socket: WebSocket) {
    const user = this.users.find((user) => user.socket === socket);
    if (!user) {
      console.error("User not found?");
      return;
    }
    this.users = this.users.filter((user) => user.socket !== socket);
  }

  broadcast(message: string) {
    this.users.forEach((u, index, arr) => {
      u.socket.send(message);
    });
  }
}
