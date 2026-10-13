const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Facility = require('../models/Facility');
const { todayStr } = require('../utils/dates');

router.get('/', protect, adminOnly, async (_req, res, next) => {
  try {
    const [facilities, byStatus, revenue, today, popular] = await Promise.all([
      Facility.countDocuments({ isActive: true }),
      Booking.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
      Booking.aggregate([{ $match: { status: 'approved' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Booking.countDocuments({ date: todayStr(), status: { $in: ['pending', 'approved'] } }),
      Booking.aggregate([
        { $match: { status: { $in: ['pending', 'approved'] } } },
        { $group: { _id: '$facility', n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 5 },
        { $lookup: { from: 'facilities', localField: '_id', foreignField: '_id', as: 'f' } },
        { $project: { _id: 0, name: { $arrayElemAt: ['$f.name', 0] }, n: 1 } }]),
    ]);
    const counts = { pending: 0, approved: 0, rejected: 0, cancelled: 0 };
    byStatus.forEach((s) => { counts[s._id] = s.n; });
    res.json({ facilities, counts, revenue: revenue[0]?.total || 0, today, popular });
  } catch (e) { next(e); }
});
module.exports = router;
