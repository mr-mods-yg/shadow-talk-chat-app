const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const cors = require('cors');
const { generateRoomId } = require('./libs/roomId');
const app = express();

app.use(cors());
app.use(express.json())
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173"
  }
});

const rooms = {};
const users = [];

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  console.log("A user connected : " + socket.id);
  users.push(socket.id);
  io.emit('chat-users', users);
  console.log("connected users : ", users);

  // create room
  socket.on('createRoom', () => {
    const roomId = generateRoomId();
    socket.join(roomId);
    rooms[roomId].push(socket.id);
    console.log("rooms : "+rooms)
  })

  socket.on('joinRoom', async (roomId) => {
    const sockets = await io.in(roomId).fetchSockets();
    if (!Object.keys(rooms).includes(roomId)) {
      socket.emit("error", "There is so such active room");
      return;
    }
    socket.join(roomId);
  });
  socket.on('messageRoom', async (roomId, message)=>{
    const sockets = await io.in(roomId).fetchSockets();
    if (!Object.keys(rooms).includes(roomId)) {
      socket.emit("error", "There is so such active room");
      return;
    }
    sockets.emit('messageRoom', message);
  })
  socket.on('disconnect', async () => {
    console.log(socket.rooms);
    users.splice(users.indexOf(socket.id), 1);
    io.emit('chat-users', users);
    console.log("connected users : ", users);
    console.log('user disconnected : ' + socket.id);
  });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});