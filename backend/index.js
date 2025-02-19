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
// rooms = {
//   "roomA": { host: "socket789" },
// };

const users = {};
// users = {
//   "socket123": { name: "Alice", roomId: "roomA" },
//   "socket456": { name: "Bob", roomId: "roomA" }
// };

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  console.log("A user connected : " + socket.id);

  // SOCKET CREATE ROOM
  socket.on('createRoom', async (name) => {
    const roomId = generateRoomId();
    socket.join(roomId);

    // add to rooms data structure
    rooms[roomId] = {host: socket.id};
    // add to users data structure
    users[socket.id] = {name, roomId};
    const sockets = await io.in(roomId).fetchSockets();
    const remainingSockets = []
    sockets.forEach((socket)=>{
      remainingSockets.push(socket.id);
    });
    console.log(remainingSockets);
    io.to(roomId).emit('roomInfo', {roomId, users: remainingSockets, usersLength: remainingSockets.length});
    console.log("rooms : "+ Object.keys(rooms));
  })

  // SOCKET JOIN ROOM
  socket.on('joinRoom', async ({roomId, name}) => {
    if(!name) {
      socket.emit("error", {message: "name not found", errorCode: "NAME_NOT_FOUND"});
      return;
    }
    if (!io.sockets.adapter.rooms.has(roomId)) {
      socket.emit("error", {message: "There is so such active room", errorCode: "ROOM_NOT_FOUND"});
      return;
    }
    socket.join(roomId);
    users[socket.id] = {name, roomId};
    // update all the users that a person has joined
    const sockets = await io.in(roomId).fetchSockets();
    const updatedSockets = []
    sockets.forEach((socket)=>{
      updatedSockets.push(socket.id);
    });
    console.log("users in room : "+updatedSockets);
    console.log("count of users in room : "+updatedSockets.length);
    io.to(roomId).emit('roomInfo', {roomId, users: updatedSockets, usersLength: updatedSockets.length});
  });

  // SOCKET MESSAGE
  socket.on('chatMessage', async (msgObj)=>{
    if(!io.sockets.adapter.rooms.has(msgObj.roomId)){
      // if the room does not exists
      socket.emit("error", {message: "No such room not found!", errorCode: "ROOM_NOT_FOUND"});
      return;
    }
    console.log("message recieved and forwarded!");
    io.to(msgObj.roomId).emit("chatMessage", msgObj); 
  })

  // SOCKET DISCONNECT
  socket.on('disconnect', async () => {
    try {
      console.log('user disconnected : ' + socket.id);
      // if user is not saved in data structure
      if(!users[socket.id]) return;
      const {roomId} = users[socket.id];
      delete users[socket.id];
      if(io.sockets.adapter.rooms.has(roomId)){
        // if there is a room update all the users that a person has left
        const sockets = await io.in(roomId).fetchSockets();
        const remainingSockets = []
        sockets.forEach((socket1)=>{
          remainingSockets.push(socket1.id);
        });
        io.to(roomId).emit('roomInfo', {roomId, users: remainingSockets, usersLength: remainingSockets.length});
      }
      else{
        console.log("room has been deleted : ", roomId);
        // if the room does not exists
        delete rooms[roomId];
        console.log('rooms left : ' + Object.keys(rooms));
      }
    } catch (error) {
      console.log("Internal Server Error : "+ error.message);
    }
  });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});