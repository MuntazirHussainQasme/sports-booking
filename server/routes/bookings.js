const router = require('express').Router();
const Booking = require('../models/Booking');
const Facility = require('../models/Facility');
const { protect, adminOnly } = require('../middleware/auth');
const { todayStr, isDate, hourOf, toTime, slotKeys } = require('../utils/dates');

const MAX_HOURS = 4;
const ACTIVE = ['pending', 'approved'];
const populate = [{ path: 'facility', select: 'name sportType location' }, { path: 'user', select: 'name email' }];

router.use(protect);

// Create a booking: validates, checks for overlaps, then saves as "pending"
router.post('/', async (req, res, next) => {
  try {
    const { facility: facilityId, date, startTime, note } = req.body;
    const hours = Number(req.body.hours);
    const facility = await Facility.findById(facilityId);
    if (!facility || !facility.isActive) return res.status(404).json({ message: 'This facility is not available for booking' });

    if (!isDate(date)) return res.status(400).json({ message: 'Pick a valid date' });
    if (date < todayStr()) return res.status(400).json({ message: 'You cannot book a date in the past' });
    if (!/^([01]\d|2[0-3]):00$/.test(startTime || '')) return res.status(400).json({ message: 'Start time must be on the hour' });
    if (!Number.isInteger(hours) || hours < 1 || hours > MAX_HOURS) return res.status(400).json({ message: `Book between 1 and ${MAX_HOURS} hours` });

    const startH = hourOf(startTime), endH = startH + hours;
    if (startH < hourOf(facility.openTime) || endH > hourOf(facility.closeTime))
      return res.status(400).json({ message: `${facility.name} is open ${facility.openTime} to ${facility.closeTime}` });
    if (date === todayStr() && startH <= new Date().getHours()) return res.status(400).json({ message: 'That time has already started' });

    const endTime = toTime(endH);
    // Overlap check: an existing booking clashes if it starts before we end AND ends after we start
    const clash = await Booking.findOne({ facility: facility._id, date, status: { $in: ACTIVE }, startTime: { $lt: endTime }, endTime: { $gt: startTime } });
    if (clash) return res.status(409).json({ message: `Already booked from ${clash.startTime} to ${clash.endTime}. Choose another time` });

    try {
      const b = await Booking.create({ user: req.user._id, facility: facility._id, date, startTime, endTime, hours,
        totalPrice: hours * facility.pricePerHour, note, slotKeys: slotKeys(facility._id, date, startH, endH) });
      res.status(201).json(await b.populate(populate));
    } catch (e) {
      // Someone else grabbed the slot between our check and the save; the unique index caught it
      if (e.code === 11000) return res.status(409).json({ message: 'That slot was just taken. Please choose another time' });
      throw e;
    }
  } catch (e) { next(e); }
});

router.get('/my', async (req, res, next) => {
  try { res.json(await Booking.find({ user: req.user._id }).populate(populate).sort('-date -startTime')); } catch (e) { next(e); }
});

// Users cancel their own upcoming bookings
router.put('/:id/cancel', async (req, res, next) => {
  try {
    const b = await Booking.findById(req.params.id);
    if (!b || String(b.user) !== String(req.user._id)) return res.status(404).json({ message: 'Booking not found' });
    if (!ACTIVE.includes(b.status)) return res.status(409).json({ message: `This booking is already ${b.status}` });
    if (new Date(`${b.date}T${b.startTime}:00`) <= new Date()) return res.status(400).json({ message: 'Past bookings cannot be cancelled' });
    b.status = 'cancelled';
    await b.save();
    res.json(await b.populate(populate));
  } catch (e) { next(e); }
});

// Admin: all bookings, filterable
router.get('/', adminOnly, async (req, res, next) => {
  try {
    const f = {};
    for (const k of ['status', 'date', 'facility']) if (req.query[k]) f[k] = req.query[k];
    res.json(await Booking.find(f).populate(populate).sort('-createdAt').limit(200));
  } catch (e) { next(e); }
});

// Admin: approve or reject
router.put('/:id/status', adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Status must be approved or rejected' });
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ message: 'Booking not found' });
    if (!ACTIVE.includes(b.status)) return res.status(409).json({ message: `This booking is already ${b.status}` });
    b.status = status;
    await b.save();
    res.json(await b.populate(populate));
  } catch (e) { next(e); }
});

module.exports = router;
