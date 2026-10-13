import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api, { errorText, fmtDate, fmtTime, money } from '../api';
import StatusBadge from '../components/StatusBadge';

export default function MyBookings() {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');

  const load = () => api.get('/bookings/my').then((r) => setBookings(r.data)).catch((e) => setError(errorText(e))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const cancel = async (b) => {
    if (!window.confirm(`Cancel your booking at ${b.facility?.name} on ${fmtDate(b.date)}?`)) return;
    try { await api.put(`/bookings/${b._id}/cancel`); setMessage('Booking cancelled.'); setError(''); load(); }
    catch (e) { setError(errorText(e)); setMessage(''); }
  };
  const canCancel = (b) => ['pending', 'approved'].includes(b.status) && new Date(`${b.date}T${b.startTime}:00`) > new Date();
  const shown = bookings.filter((b) => !filter || b.status === filter);

  return (
    <div className="page">
      <div className="head">
        <h1>My bookings</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option><option>pending</option><option>approved</option><option>rejected</option><option>cancelled</option>
        </select>
      </div>
      {message && <p className="ok">{message}</p>}
      {error && <p className="err">{error}</p>}
      {loading && <p className="muted">Loading…</p>}
      {!loading && shown.length === 0 && <p className="empty">{bookings.length ? 'No bookings with that status.' : 'You have no bookings yet.'} <Link to="/facilities">Find a facility</Link></p>}

      <div className="stack">
        {shown.map((b) => (
          <article className="booking" key={b._id}>
            <div>
              <h3>{b.facility?.name || 'Removed facility'}</h3>
              <p>{fmtDate(b.date)} · {fmtTime(b.startTime)} to {fmtTime(b.endTime)}</p>
              <p className="muted">{b.facility?.sportType} · {money(b.totalPrice)}{b.note ? ` · “${b.note}”` : ''}</p>
            </div>
            <div className="booking-side">
              <StatusBadge status={b.status} />
              {canCancel(b) && <button className="btn small danger" onClick={() => cancel(b)}>Cancel</button>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
