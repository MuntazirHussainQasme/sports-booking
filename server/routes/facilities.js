const router = require('express').Router();
const Facility = require('../models/Facility');
const Booking = require('../models/Booking');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { isDate } = require('../utils/dates');

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Public: browse facilities. Visitors only see active ones; admins can pass ?all=true to see everything.
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const f = {};
    if (!(req.user?.role === 'admin' && req.query.all === 'true')) f.isActive = true;
    if (req.query.sport) f.sportType = req.query.sport;
    if (req.query.q) f.$or = [{ name: new RegExp(esc(req.query.q), 'i') }, { location: new RegExp(esc(req.query.q), 'i') }];
    res.json(await Facility.find(f).sort('sportType name'));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const f = await Facility.findById(req.params.id);
    if (!f) return res.status(404).json({ message: 'Facility not found' });
    res.json(f);
  } catch (e) { next(e); }
});

// Which time ranges are already held on a given day
router.get('/:id/availability', async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!isDate(date)) return res.status(400).json({ message: 'Pick a valid date' });
    const f = await Facility.findById(req.params.id);
    if (!f) return res.status(404).json({ message: 'Facility not found' });
    const booked = await Booking.find({ facility: f._id, date, status: { $in: ['pending', 'approved'] } }).select('startTime endTime status -_id');
    res.json({ openTime: f.openTime, closeTime: f.closeTime, booked });
  } catch (e) { next(e); }
});

router.post('/', protect, adminOnly, async (req, res, next) => {
  try { res.status(201).json(await Facility.create(req.body)); } catch (e) { next(e); }
});

router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const f = await Facility.findById(req.params.id);
    if (!f) return res.status(404).json({ message: 'Facility not found' });
    f.set(req.body);
    await f.save();
    res.json(f);
  } catch (e) { next(e); }
});

router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    if (await Booking.exists({ facility: req.params.id }))
      return res.status(409).json({ message: 'This facility has bookings. Deactivate it instead of deleting it' });
    const f = await Facility.findByIdAndDelete(req.params.id);
    if (!f) return res.status(404).json({ message: 'Facility not found' });
    res.json({ message: 'Facility deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
