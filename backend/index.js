const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const cors = require('cors');
const { generateRoomId } = require('./libs/roomId');

const app = express();
require('dotenv').config()

console.log(process.env.FRONTEND_URL);

app.use(cors());
app.use(express.json())

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL
  },
  maxHttpBufferSize: 10e6 //Allow up to 10 MB (default is 1 MB)
});

const rooms = {};
// rooms = {
//   "roomA": { host: "socket789", typing: ["socket123", "socket456"]},
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
    rooms[roomId] = {host: socket.id, typing: []};
    // add to users data structure
    users[socket.id] = {name, roomId};

    // check connected sockets and sent to all users in the room
    const sockets = await io.in(roomId).fetchSockets();
    const remainingSockets = {}
    sockets.forEach((socket)=>{
      remainingSockets[socket.id] = {name: users[socket.id].name};
    });
    io.to(roomId).emit('roomInfo', {roomId, users: remainingSockets, usersLength: Object.keys(remainingSockets).length});

    // print the active rooms for server logs
    console.log("rooms : "+ Object.keys(rooms));
  })

  // SOCKET JOIN ROOM
  socket.on('joinRoom', async ({roomId, name}) => {
    if(!name) {
      // user has not defined his name
      socket.emit("error", {message: "name not found", errorCode: "NAME_NOT_FOUND"});
      return;
    }
    if (!io.sockets.adapter.rooms.has(roomId)) {
      // room does not exists (anymore)
      socket.emit("error", {message: "There is so such active room", errorCode: "ROOM_NOT_FOUND"});
      return;
    }
    // if room exists join the room
    socket.join(roomId);
    // update users data structure
    users[socket.id] = {name, roomId};
    // update all the users that a person has joined
    const sockets = await io.in(roomId).fetchSockets();
    const updatedSockets = {}
    sockets.forEach((socket)=>{
      updatedSockets[socket.id] = {name: users[socket.id].name};
    });
    // print server logs that a room has been updated
    console.log("users in room : "+Object.keys(updatedSockets));
    console.log("count of users in room : "+Object.keys(updatedSockets).length);
    io.to(roomId).emit('roomInfo', {roomId, users: updatedSockets, usersLength: Object.keys(updatedSockets).length});
  });

  // SOCKET MESSAGE
  socket.on('chatMessage', async (msgObj)=>{
    if(!io.sockets.adapter.rooms.has(msgObj.roomId)){
      // if the room does not exists
      socket.emit("error", {message: "No such room not found!", errorCode: "ROOM_NOT_FOUND"});
      return;
    }
    // room exists and sent the message to everyone in the room
    // console.log("message recieved and forwarded!");
    io.to(msgObj.roomId).emit("chatMessage", msgObj); 
  })

  // HANDLE TYPING
  let hasMessageSent = false;
  socket.on('userTyping', async({senderId, roomId})=>{
    if(!io.sockets.adapter.rooms.has(roomId) || !rooms[roomId]){
      // if the room does not exists
      socket.emit("error", {message: "No such room not found!", errorCode: "ROOM_NOT_FOUND"});
      return;
    }
    // add the active typing users but not twice
    if(!rooms[roomId].typing.includes(senderId)) rooms[roomId].typing.push(senderId);

    // message cooldown
    if(hasMessageSent) return;
    hasMessageSent=true;
    // all connected users in the room
    const sockets = await io.in(roomId).fetchSockets();
    sockets.forEach((socket)=>{
      // filtering the current user out
      socket.emit('typingUsers', rooms[roomId].typing.filter(id=>id!=socket.id))
    });
    timer = setTimeout(()=>{
      hasMessageSent=false;
      // remove the inactive typing users
      rooms[roomId].typing = rooms[roomId].typing.filter((item)=>item!=senderId);
    }, 1000);
    
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
        const remainingSockets = {}
        sockets.forEach((socket)=>{
          remainingSockets[socket.id] = {name: users[socket.id].name};
        });
        io.to(roomId).emit('roomInfo', {roomId, users: remainingSockets, usersLength: Object.keys(remainingSockets).length});
      }
      else{
        console.log("room has been deleted : ", roomId);
        // delete room if it exists in active rooms
        if(rooms[roomId]) delete rooms[roomId];
        console.log('rooms left : ' + Object.keys(rooms));
      }
    } catch (error) {
      console.log("Internal Server Error : "+ error.message);
    }
  });
});
const PORT = process.env.BACKEND_PORT
server.listen(PORT, () => {
  console.log('server running at PORT '+PORT);
});