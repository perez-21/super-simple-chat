"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chatroom = void 0;
class Chatroom {
    constructor() {
        this.users = [];
    }
    addUser(user) {
        this.users.push(user);
        this.addMessageHandler(user);
    }
    addMessageHandler(user) {
        user.socket.on("message", (data) => {
            const message = data.toString();
            this.broadcast(message);
        });
    }
    removeUser(socket) {
        const user = this.users.find((user) => user.socket === socket);
        if (!user) {
            console.error("User not found?");
            return;
        }
        this.users = this.users.filter((user) => user.socket !== socket);
    }
    broadcast(message) {
        this.users.forEach((u, index, arr) => {
            u.socket.send(message);
        });
    }
}
exports.Chatroom = Chatroom;
