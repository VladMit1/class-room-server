const User = require('../models/User');

class VideoChatController {
   async studentsList(req, res) {
      try {
         const users = await User.find({
            isTeacher: false
         });
         return res.json(users);
      } catch (error) {
         console.log(error);
         return res.status(500).json({ message: `you don't have students` });
      }
   }

   async joinChat(req, res) {
      try {
         console.log(req.body);
      } catch (error) {
         console.log(error);
         return res.status(500).json({ message: 'user is not online' });
      }
   }
}

module.exports = new VideoChatController();
