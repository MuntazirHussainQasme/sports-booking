const mongoose = require('mongoose');
const User = require('../models/User'), Facility = require('../models/Facility'), Booking = require('../models/Booking');
const { addDays, hourOf, slotKeys } = require('./dates');

module.exports = async function seed(force = false) {
  if (!force && (await User.countDocuments())) return false;
  await Promise.all([User, Facility, Booking].map((m) => m.deleteMany()));
  await Booking.syncIndexes();

  const admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin' });
  const user = await User.create({ name: 'Demo User', email: 'user@example.com', password: 'user123' });
  const other = await User.create({ name: 'Ali Raza', email: 'ali@example.com', password: 'ali12345' });

  const fac = await Facility.create([
    { name: 'Haripur Cricket Ground', sportType: 'Cricket', location: 'Sports Complex, Haripur', pricePerHour: 3500, openTime: '07:00', closeTime: '20:00', description: 'Full-size turf wicket with floodlights and a pavilion. Suited to club matches and practice sessions.' },
    { name: 'Futsal Arena A', sportType: 'Football', location: 'Model Town, Haripur', pricePerHour: 2500, openTime: '08:00', closeTime: '23:00', description: 'Indoor artificial-turf court for 5-a-side games, with changing rooms and parking.' },
    { name: 'Badminton Hall', sportType: 'Badminton', location: 'University Road, Haripur', pricePerHour: 800, openTime: '06:00', closeTime: '22:00', description: 'Four wooden-floor courts with proper lighting. Rackets and shuttles are available at the desk.' },
    { name: 'Centre Court Tennis', sportType: 'Tennis', location: 'Garrison Club, Abbottabad Road', pricePerHour: 1500, openTime: '06:00', closeTime: '19:00', description: 'Hard court with night lighting. Coaching can be arranged on request.' },
    { name: 'Squash Court 1', sportType: 'Squash', location: 'Sports Complex, Haripur', pricePerHour: 1200, openTime: '09:00', closeTime: '21:00', description: 'International-size glass-back court.' },
    { name: 'Basketball Court', sportType: 'Basketball', location: 'City Park, Haripur', pricePerHour: 1000, openTime: '06:00', closeTime: '21:00', description: 'Outdoor court with fibreglass backboards.' },
    { name: 'Old Hockey Ground', sportType: 'Hockey', location: 'Cantt Area', pricePerHour: 2000, openTime: '07:00', closeTime: '18:00', isActive: false, description: 'Closed for resurfacing.' },
  ]);

  // [facility, day offset, start, hours, user, status]
  const plan = [
    [0, 1, '16:00', 3, user, 'approved'], [1, 1, '19:00', 2, user, 'pending'], [2, 2, '18:00', 1, other, 'approved'],
    [1, 1, '21:00', 1, other, 'approved'], [3, 3, '08:00', 2, user, 'pending'], [4, 0, '17:00', 1, other, 'approved'],
    [2, -3, '18:00', 2, user, 'approved'], [5, -5, '16:00', 2, user, 'rejected'], [0, 5, '15:00', 2, other, 'pending'],
  ];
  for (const [fi, off, start, hours, u, status] of plan) {
    const f = fac[fi], date = addDays(off), s = hourOf(start), e = s + hours;
    await Booking.create({ user: u._id, facility: f._id, date, startTime: start, endTime: `${String(e).padStart(2, '0')}:00`, hours,
      totalPrice: hours * f.pricePerHour, status, slotKeys: slotKeys(f._id, date, s, e) });
  }
  return true;
};
