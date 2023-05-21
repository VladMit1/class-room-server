const { Schema, model, Types } = require('mongoose');

const Event = new Schema({
   title: { type: String, required: true },
   description: { type: String, required: true },
   accessLink: { type: String },
   dateCreateEvent: { type: String, default: '', required: true },
   duration: { type: String, default: '', required: true },
   user: { type: Types.ObjectId, ref: 'User' }
});

module.exports = model('Event', Event);
