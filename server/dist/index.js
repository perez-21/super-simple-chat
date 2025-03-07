"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const chatroom_1 = require("./chatroom");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
console.log("web socket server is running");
const wss = new ws_1.WebSocketServer({ port: 8080 });
const chatroom = new chatroom_1.Chatroom();
wss.on("connection", function connection(ws) {
    return __awaiter(this, void 0, void 0, function* () {
        chatroom.addUser({ socket: ws });
        ws.on("error", console.error);
        ws.on("message", function message(data) {
            console.log("received: %s", data);
        });
        ws.on("close", () => chatroom.removeUser(ws));
    });
});
const app = (0, express_1.default)();
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static("public"));
app.get("/", (req, res) => {
    res.render("index.ejs");
});
app.listen(3000, () => {
    console.log("express server listening on port 3000");
});
