const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const authRouter = require('./routes/auth.routes');
const fileRouter = require('./routes/file.routes');
const eventRouter = require('./routes/event.routes');
const chatRouter = require('./routes/chat.routes');
const app = express();
const middleware = require('./middleware/cors.middleware');
const filePathMiddleware = require('./middleware/filepath.middleware');
const path = require('path');
require('dotenv').config();
const PORT = process.env.PORT;
const cors = require('cors');
const BASE_URL = process.env.BASE_URL_PORT;

const corsOptions = {
   origin: [
      'http://localhost:5173'
      //'https://class-room-gate-r0jjernaf-vladmit1.vercel.app/',
      //'https://class-room-gate-git-master-vladmit1.vercel.app/',
      //'https://class-room-gate.vercel.app/'
   ],
   credentials: true, //access-control-allow-credentials:true
   optionSuccessStatus: 200
};
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
   cors: {
      corsOptions,
      methods: ['GET', 'POST']
   }
});
let usersList = [];

async function createServer() {
   app.use(filePathMiddleware(path.resolve(__dirname)));
   app.use(fileUpload({}));
   app.use(middleware);
   app.use(express.json());
   app.use(express.urlencoded({ extended: true }));
   app.use(express.static('static'));
   app.use(cors(corsOptions));
   app.use('/api', fileRouter);
   app.use('/api/auth', authRouter);
   app.use('/api/calendar', eventRouter);
   app.use('/api/chat', chatRouter);

   io.on('connection', (socket) => {
      console.log(`User was connected (${socket.id})`);

      socket.emit('me', socket.id);

      socket.on('newUser', (data) => {
         usersList.push(data);

         io.emit('newUserResponse', usersList);
      });

      socket.on('callUser', (data) => {
         io.to(
            data.userToCall.emit('callUser', {
               signal: data.signalData,
               from: data.from,
               name: data.name
            })
         );
      });
      socket.on('answerCall', (data) => {
         io.to(data.to).emit('callAccepted'), data.signal;
      });
      socket.on('disconnect', () => {
         usersList = usersList.filter((user) => user.socketID !== socket.id);
         socket.broadcast.emit('callEnded');
         io.emit('newUserResponse', usersList);
         console.log('🔥: A user disconnected');
         socket.disconnect();
      });
   });

   try {
      mongoose.set('strictQuery', false);
      await mongoose.connect(BASE_URL);
      server.listen(PORT, () => {
         console.log('-----------------------------------');
         console.log(`  App running in port ${PORT}`);
         console.log('-----------------------------------');
         console.log(
            `  > Local: \x1b[36mhttp://localhost:\x1b[1m${PORT}/\x1b[0m`
         );
      });
   } catch (e) {
      console.log(e.message);
   }
}

createServer();
