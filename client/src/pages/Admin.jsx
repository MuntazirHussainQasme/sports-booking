import { useEffect, useState } from 'react';
import api, { errorText, fmtDate, fmtTime, money } from '../api';
import StatusBadge from '../components/StatusBadge';
import FacilityCard from '../components/FacilityCard';

const blank = { name: '', sportType: '', location: '', pricePerHour: '', openTime: '06:00', closeTime: '22:00', description: '', isActive: true };
const HOURS = Array.from({ length: 19 }, (_, i) => `${String(i + 5).padStart(2, '0')}:00`);   // 05:00 to 23:00

function BookingsTab({ onChange }) {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/bookings', { params: { status: status || undefined } })
    .then((r) => { setRows(r.data); setError(''); }).catch((e) => setError(errorText(e))).finally(() => setLoading(false));
  useEffect(() => { setLoading(true); load(); }, [status]);

  const decide = async (b, next) => {
    try { await api.put(`/bookings/${b._id}/status`, { status: next }); load(); onChange(); } catch (e) { setError(errorText(e)); }
  };

  return (
    <>
      <div className="head">
        <h2>Booking requests</h2>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option><option>pending</option><option>approved</option><option>rejected</option><option>cancelled</option>
        </select>
      </div>
      {error && <p className="err">{error}</p>}
      {loading && <p className="muted">Loading…</p>}
      {!loading && rows.length === 0 && <p className="empty">No {status || ''} bookings.</p>}
      {rows.length > 0 && (
        <div className="scroll"><table className="table">
          <thead><tr><th>Facility</th><th>User</th><th>When</th><th>Total</th><th>Status</th><th /></tr></thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b._id}>
                <td><b>{b.facility?.name}</b></td>
                <td>{b.user?.name}<div className="muted">{b.user?.email}</div></td>
                <td>{fmtDate(b.date)}<div className="muted">{fmtTime(b.startTime)} to {fmtTime(b.endTime)}</div>{b.note && <div className="muted">“{b.note}”</div>}</td>
                <td>{money(b.totalPrice)}</td>
                <td><StatusBadge status={b.status} /></td>
                <td>
                  {['pending', 'approved'].includes(b.status) && (
                    <div className="row">
                      {b.status === 'pending' && <button className="btn small ok-btn" onClick={() => decide(b, 'approved')}>Approve</button>}
                      <button className="btn small danger" onClick={() => decide(b, 'rejected')}>Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </>
  );
}

function FacilitiesTab({ onChange }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(null);     // null = closed
  const [error, setError] = useState('');
  const load = () => api.get('/facilities', { params: { all: true } }).then((r) => setItems(r.data)).catch((e) => setError(errorText(e)));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.sportType.trim() || !form.location.trim() || form.pricePerHour === '') return setError('Name, sport, location and price are required');
    try {
      const body = { ...form, pricePerHour: Number(form.pricePerHour) };
      form._id ? await api.put(`/facilities/${form._id}`, body) : await api.post('/facilities', body);
      setForm(null); setError(''); load(); onChange();
    } catch (err) { setError(errorText(err)); }
  };
  const remove = async (f) => {
    if (!window.confirm(`Delete ${f.name}?`)) return;
    try { await api.delete(`/facilities/${f._id}`); setError(''); load(); onChange(); } catch (err) { setError(errorText(err)); }
  };
  const toggle = async (f) => { try { await api.put(`/facilities/${f._id}`, { isActive: !f.isActive }); load(); onChange(); } catch (err) { setError(errorText(err)); } };

  return (
    <>
      <div className="head"><h2>Facilities</h2>{!form && <button className="btn" onClick={() => setForm(blank)}>Add facility</button>}</div>
      {form && (
        <form className="panel form-grid" onSubmit={save} noValidate>
          <h3 className="wide">{form._id ? `Edit ${form.name}` : 'New facility'}</h3>
          <label>Name<input value={form.name} onChange={set('name')} /></label>
          <label>Sport type<input value={form.sportType} onChange={set('sportType')} placeholder="Cricket, Tennis…" /></label>
          <label>Location<input value={form.location} onChange={set('location')} /></label>
          <label>Price per hour (Rs)<input type="number" min="0" value={form.pricePerHour} onChange={set('pricePerHour')} /></label>
          <label>Opens<select value={form.openTime} onChange={set('openTime')}>{HOURS.map((h) => <option key={h}>{h}</option>)}</select></label>
          <label>Closes<select value={form.closeTime} onChange={set('closeTime')}>{HOURS.map((h) => <option key={h}>{h}</option>)}</select></label>
          <label className="wide">Description<textarea rows="2" value={form.description || ''} onChange={set('description')} /></label>
          <label className="check wide"><input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Open for booking</label>
          {error && <p className="err wide">{error}</p>}
          <div className="row wide"><button className="btn">Save facility</button><button type="button" className="btn ghost" onClick={() => { setForm(null); setError(''); }}>Cancel</button></div>
        </form>
      )}
      {!form && error && <p className="err">{error}</p>}
      <div className="grid">
        {items.map((f) => (
          <div key={f._id} className="admin-card">
            <FacilityCard facility={f} />
            <div className="row">
              <button className="btn small" onClick={() => setForm({ ...f })}>Edit</button>
              <button className="btn small ghost" onClick={() => toggle(f)}>{f.isActive ? 'Deactivate' : 'Activate'}</button>
              <button className="btn small danger" onClick={() => remove(f)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('bookings');
  const [stats, setStats] = useState(null);
  const loadStats = () => api.get('/stats').then((r) => setStats(r.data)).catch(() => {});
  useEffect(() => { loadStats(); }, []);

  return (
    <div className="page">
      <h1>Admin dashboard</h1>
      {stats && (
        <section className="tiles">
          <div className="tile hot"><b>{stats.counts.pending}</b><span>Pending requests</span></div>
          <div className="tile"><b>{stats.today}</b><span>Bookings today</span></div>
          <div className="tile"><b>{stats.counts.approved}</b><span>Approved</span></div>
          <div className="tile"><b>{stats.facilities}</b><span>Active facilities</span></div>
          <div className="tile"><b>{money(stats.revenue)}</b><span>Approved revenue</span></div>
        </section>
      )}
      <div className="tabs">
        <button className={tab === 'bookings' ? 'on' : ''} onClick={() => setTab('bookings')}>Bookings</button>
        <button className={tab === 'facilities' ? 'on' : ''} onClick={() => setTab('facilities')}>Facilities</button>
      </div>
      {tab === 'bookings' ? <BookingsTab onChange={loadStats} /> : <FacilitiesTab onChange={loadStats} />}
    </div>
  );
}
