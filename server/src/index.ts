import { WebSocketServer } from "ws";
import { Chatroom } from "./chatroom";
import express from "express";
import bodyParser from "body-parser";

console.log("web socket server is running");
const wss = new WebSocketServer({ port: 8080 });
const chatroom = new Chatroom();

wss.on("connection", async function connection(ws) {
  chatroom.addUser({ socket: ws });

  ws.on("error", console.error);

  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });

  ws.on("close", () => chatroom.removeUser(ws));

  ws.send("something");
});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.listen(3000, () => {
  console.log("express server listening on port 3000");
});
