import { useEffect, useMemo, useState } from 'react';
import api, { errorText, today, money, hourOf, fmtHour } from '../api';
import SlotPicker from './SlotPicker';

export default function BookingForm({ facility, onBooked }) {
  const [date, setDate] = useState(today());
  const [booked, setBooked] = useState([]);
  const [start, setStart] = useState(null);
  const [hours, setHours] = useState(1);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const openH = hourOf(facility.openTime), closeH = hourOf(facility.closeTime);

  const loadSlots = () => {
    setLoading(true);
    return api.get(`/facilities/${facility._id}/availability`, { params: { date } })
      .then((r) => setBooked(r.data.booked)).catch((e) => setError(errorText(e))).finally(() => setLoading(false));
  };
  useEffect(() => { setStart(null); setError(''); loadSlots(); }, [date]);

  const taken = useMemo(() => {
    const s = new Set();
    booked.forEach((b) => { for (let h = hourOf(b.startTime); h < hourOf(b.endTime); h++) s.add(h); });
    return s;
  }, [booked]);
  const isPast = (h) => date === today() && h <= new Date().getHours();

  const range = start == null ? [] : Array.from({ length: hours }, (_, i) => start + i);
  const fits = range.length > 0 && range.every((h) => h >= openH && h < closeH && !taken.has(h) && !isPast(h));
  const problem = start != null && !fits ? 'That length runs into a booked hour or past closing time. Pick fewer hours or a different start.' : '';

  const submit = async (e) => {
    e.preventDefault();
    if (!fits) return;
    setSaving(true); setError('');
    try {
      const { data } = await api.post('/bookings', { facility: facility._id, date, startTime: `${String(start).padStart(2, '0')}:00`, hours, note });
      onBooked(data);
    } catch (err) { setError(errorText(err)); loadSlots(); }   // refresh so a slot someone just took shows as booked
    finally { setSaving(false); }
  };

  return (
    <form className="panel stack" onSubmit={submit} noValidate>
      <div className="form-row">
        <label>Date<input type="date" min={today()} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} /></label>
        <label>How long
          <select value={hours} onChange={(e) => setHours(Number(e.target.value))}>
            {[1, 2, 3, 4].map((h) => <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>)}
          </select>
        </label>
      </div>

      <div>
        <p className="label">Pick a start time {loading && <span className="muted">(checking availability…)</span>}</p>
        <SlotPicker openH={openH} closeH={closeH} taken={taken} isPast={isPast} start={start} hours={hours} onPick={setStart} />
        <p className="legend"><i className="slot free" />Available <i className="slot booked" />Booked <i className="slot start" />Your choice</p>
      </div>

      <label>Note for the admin (optional)<input maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Team practice, 14 players" /></label>

      <div className="summary">
        {fits
          ? <p><b>{fmtHour(start)} to {fmtHour(start + hours)}</b> · {hours} hour{hours > 1 ? 's' : ''} · <b>{money(hours * facility.pricePerHour)}</b></p>
          : <p className="muted">Choose a start time to see your total.</p>}
      </div>
      {(problem || error) && <p className="err">{problem || error}</p>}
      <button className="btn" disabled={!fits || saving}>{saving ? 'Booking…' : 'Request booking'}</button>
      <p className="muted">New bookings are pending until an administrator approves them. Pending bookings still hold the slot.</p>
    </form>
  );
}
