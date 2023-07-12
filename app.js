const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const socketio = require("socket.io");
const app = express();
const { huggingfaceAPI } = require("./config/hf");

dotenv.config();

app.use(express.static(path.join(__dirname, "views")));
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => console.log("HELLO SERVER STARTED"));

const io = socketio(server, {
  allowEIO3: true,
  transports: ['websocket'],
  secure: true,
})

io.on("connection", function (socket) {
  let a,b;
  socket.on("chat message", (message) => {
    const getMessageHF = async () => {
      try {
        let response = await huggingfaceAPI({
          a: a,
          b: b,
          c: message,
        });
        a = message;
        b = response.generated_text;
        const result = response.generated_text;
        socket.emit("bot reply", result);
      } catch (error) {
        console.log(error);
      }
    };
    getMessageHF();
  });
});
