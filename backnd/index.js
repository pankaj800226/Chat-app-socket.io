const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");


const app = express();
//PORT number
const PORT = 5000
//medial Waire
app.use(cors());
app.use(express.json());    //this is a data received to client

// createServer
const server = http.createServer(app); //create a node js server work


//socket.io server create
const io = new Server(server, {
  //create a socket.io server work
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

//socket connection
io.on('connect', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User with ID: ${socket.id} joined room: ${room}`);
  });

  socket.on('send_message', (data) => {
    console.log('Message received on server:', data);
    socket.to(data.room).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

//server port
server.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
