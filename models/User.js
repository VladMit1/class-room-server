const { Schema, model, Types } = require('mongoose');

const User = new Schema({
   email: { type: String, required: true, unique: true },
   password: { type: String, required: true },
   repeatPassword: { type: String },
   isTeacher: { type: Boolean, default: false, required: true },
   userName: { type: String },
   avatar: { type: String },
   events: [{ type: Types.ObjectId, ref: 'Event' }],
   library: [{ type: String }]
});

module.exports = model('User', User);
