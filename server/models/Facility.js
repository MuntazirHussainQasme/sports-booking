const mongoose = require('mongoose');
const HOUR = /^([01]\d|2[0-3]):00$/;

const schema = new mongoose.Schema({
  name: { type: String, required: [true, 'Facility name is required'], trim: true },
  sportType: { type: String, required: [true, 'Sport type is required'], trim: true },
  location: { type: String, required: [true, 'Location is required'], trim: true },
  pricePerHour: { type: Number, required: [true, 'Price per hour is required'], min: [0, 'Price cannot be negative'] },
  description: { type: String, trim: true, maxlength: [600, 'Description can be up to 600 characters'] },
  openTime: { type: String, default: '06:00', match: [HOUR, 'Opening time must be on the hour, like 06:00'] },
  closeTime: { type: String, default: '22:00', match: [HOUR, 'Closing time must be on the hour, like 22:00'] },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

schema.pre('validate', function (next) {
  if (parseInt(this.closeTime) <= parseInt(this.openTime)) this.invalidate('closeTime', 'Closing time must be after opening time');
  next();
});
module.exports = mongoose.model('Facility', schema);
