const Event = require('../models/Event');
const User = require('../models/User');
//console.log(currentTime);

class EventController {
   async addEvent(req, res) {
      try {
         const { title, description, dateCreateEvent, duration } = req.body;
         const event = new Event({
            title,
            description,
            dateCreateEvent,
            duration,
            user: req.user.id
         });
         await event.save();
         return res.json(event);
      } catch (error) {
         console.log(error);
         return res.status(500).json({ message: 'event not created' });
      }
   }

   async getEvents(req, res) {
      try {
         const events = await Event.find({
            user: req.user.id,

            dateCreateEvent: {
               $gte: req.query.start,
               $lte: req.query.end
            }
         });
         return res.json(events);
      } catch (error) {
         console.log(error);
         return res.status(500).json({ message: 'no one get events' });
      }
   }

   async updateEvents(req, res) {
      try {
         const id = req.query._id;
         let events;
         events = await Event.findByIdAndUpdate(id, { $set: req.body });
         await events.save();
         console.log(req);

         return res.json(events);
      } catch (error) {
         console.log(error);
         return res.status(500).json({ message: 'no one get events' });
      }
   }

   async deleteEvent(req, res) {
      try {
         const event = await Event.findOne({
            _id: req.query._id
         });
         event.remove();
         !event && res.status(400).json({ message: 'event not found' });
         return res.json({ message: 'event was deleted' });
      } catch (e) {
         console.log(e);
         return res.status(400).json({ message: 'Dir is not empty' });
      }
   }
}
module.exports = new EventController();
