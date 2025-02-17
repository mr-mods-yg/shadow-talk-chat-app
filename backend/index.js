const express = require('express');
const { log } = require('node:console');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173"
  }
});

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public','index.html'));
});
const users = new Array();
io.on('connection', (socket) => {
    console.log("A new user joined : "+socket.id);
    users.push(socket.id);
    io.emit('chat-users', users);
    console.log("connected users : ", users);

    socket.on('chat-message', (msg) => {
        console.log(msg);
        io.emit('chat-message', msg);
      });
    socket.on('disconnect', () => {
        users.splice(users.indexOf(socket.id), 1);
        io.emit('chat-users', users);
        console.log("connected users : ", users);
        console.log('user disconnected : '+socket.id);
    });
  });

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});