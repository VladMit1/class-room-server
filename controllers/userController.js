const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;
const { validationResult } = require('express-validator');

class UserController {
   async registration(req, res) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return res
               .status(400)
               .json({ message: 'Incorrect request', errors });
         }
         const { email, password, repeatPassword, isTeacher, userName } =
            req.body;
         const candidate = await User.findOne({ email });
         if (candidate) {
            return res
               .status(400)
               .json({ message: `User with email ${email} already exist` });
         }
         if (password === repeatPassword) {
            const hashPassword = await bcrypt.hash(password, 8);
            const user = new User({
               email,
               password: hashPassword,
               isTeacher,
               userName
            });
            await user.save();
            res.json({ message: 'User was created' });
         } else {
            return res.status(400).json({ message: `Incorrect password` });
         }
      } catch (e) {
         console.log(e);
         res.send({ message: 'Server error' });
      }
   }

   async login(req, res) {
      try {
         const { email, password, socket } = req.body;
         const user = await User.findOne({ email });
         if (!user) {
            return res.status(404).json({ message: 'User not found' });
         }
         const isPassValid = bcrypt.compareSync(password, user.password);
         if (!isPassValid) {
            return res.status(400).json({ message: 'Invalid password' });
         }
         const token = jwt.sign({ id: user.id }, SECRET_KEY, {
            expiresIn: '1h'
         });
         await User.findByIdAndUpdate(user.id, {
            $set: { socket: socket }
         });

         return res.json({
            token,
            user: {
               id: user.id,
               email: user.email,
               avatar: user.avatar,
               userName: user.userName,
               events: [...user.events],
               socket: socket
            }
         });
      } catch (e) {
         console.log(e);
         res.send({ message: 'Server error' });
      }
   }

   async authorization(req, res) {
      try {
         const user = await User.findOne({ _id: req.user.id });
         const token = jwt.sign({ id: user.id }, SECRET_KEY, {
            expiresIn: '1h'
         });

         return res.json({
            token,
            user: {
               id: user.id,
               email: user.email,
               avatar: user.avatar,
               userName: user.userName,
               events: [...user.events],
               socket: user.socket
            }
         });
      } catch (e) {
         console.log(e);
         res.send({ message: 'Server error' });
      }
   }
}
module.exports = new UserController();
