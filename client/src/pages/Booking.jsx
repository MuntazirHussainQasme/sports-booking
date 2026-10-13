import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errorText, money } from '../api';
import BookingForm from '../components/BookingForm';

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [f, setF] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get(`/facilities/${id}`).then((r) => setF(r.data)).catch((e) => setError(errorText(e))); }, [id]);

  if (error) return <div className="page"><p className="err">{error}</p></div>;
  if (!f) return <div className="page"><p className="muted">Loading…</p></div>;
  if (!f.isActive) return <div className="page"><p className="empty">This facility is not open for booking.</p><Link to="/facilities">Back to facilities</Link></div>;

  return (
    <div className="page narrow">
      <p><Link to={`/facilities/${f._id}`}>← {f.name}</Link></p>
      <h1>Book {f.name}</h1>
      <p className="muted">{f.sportType} · {f.location} · {money(f.pricePerHour)} / hour</p>
      <BookingForm facility={f} onBooked={(b) => navigate('/my-bookings', { state: { message: `Request sent for ${b.facility.name}. It is pending approval.` } })} />
    </div>
  );
}
