const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;
const { json } = require('express');
module.exports = (req, res, next) => {
   if (req.method === 'OPTIONS') {
      return next();
   }
   try {
      const token = req.headers.authorization.split(' ')[1];
      if (!token) {
         return res.status(401), json({ message: 'Auth error' });
      }
      const decoded = jwt.verify(token, SECRET_KEY);
      req.user = decoded;
      next();
   } catch (error) {
      return res.status(401), json({ message: 'Auth error' });
   }
};
