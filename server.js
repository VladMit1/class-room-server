const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const authRouter = require('./routes/auth.routes');
const fileRouter = require('./routes/file.routes');
const eventRouter = require('./routes/event.routes');
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
      'http://localhost:5173',
      'https://class-room-gate-r0jjernaf-vladmit1.vercel.app/',
      'https://class-room-gate-git-master-vladmit1.vercel.app/',
      'https://class-room-gate.vercel.app/'
   ],
   credentials: true, //access-control-allow-credentials:true
   optionSuccessStatus: 200
};
async function createServer() {
   app.use(filePathMiddleware(path.resolve(__dirname)));
   app.use(fileUpload({}));
   app.use(middleware);
   app.use(express.json());
   app.use(express.urlencoded({ extended: true }));
   app.use(express.static('static'));
   app.use(cors(corsOptions));
   app.use('/api/auth', authRouter);
   app.use('/api/calendar', eventRouter);
   app.use('/api', fileRouter);

   try {
      mongoose.set('strictQuery', false);
      await mongoose.connect(BASE_URL);
      app.listen(PORT, () => {
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
