const mongoose = require('mongoose');
const { Schema } = mongoose;
const HOUR = /^([01]\d|2[0-3]):00$/;

const schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  facility: { type: Schema.Types.ObjectId, ref: 'Facility', required: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  startTime: { type: String, required: true, match: HOUR },
  endTime: { type: String, required: true, match: HOUR },
  hours: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  note: { type: String, trim: true, maxlength: [200, 'Note can be up to 200 characters'] },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  slotKeys: [String],
}, { timestamps: true });

// Only pending/approved bookings hold their slots; rejecting or cancelling frees them automatically.
schema.index({ slotKeys: 1 }, { unique: true, partialFilterExpression: { status: { $in: ['pending', 'approved'] } } });
schema.index({ user: 1, date: -1 });
schema.index({ facility: 1, date: 1 });
module.exports = mongoose.model('Booking', schema);
