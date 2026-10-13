import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errorText, money, fmtTime } from '../api';
import { useAuth } from '../context/AuthContext';

export default function FacilityDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [f, setF] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get(`/facilities/${id}`).then((r) => setF(r.data)).catch((e) => setError(errorText(e))); }, [id]);

  if (error) return <div className="page"><p className="err">{error}</p><Link to="/facilities">← All facilities</Link></div>;
  if (!f) return <div className="page"><p className="muted">Loading…</p></div>;

  return (
    <div className="page narrow">
      <p><Link to="/facilities">← All facilities</Link></p>
      <span className="chip static">{f.sportType}</span>
      <h1>{f.name}</h1>
      <p className="muted">{f.location}</p>
      <dl className="facts">
        <div><dt>Price</dt><dd>{money(f.pricePerHour)} / hour</dd></div>
        <div><dt>Opening hours</dt><dd>{fmtTime(f.openTime)} to {fmtTime(f.closeTime)}</dd></div>
        <div><dt>Status</dt><dd>{f.isActive ? 'Open for booking' : 'Not available'}</dd></div>
      </dl>
      {f.description && <p>{f.description}</p>}
      {f.isActive ? (
        user
          ? <Link className="btn" to={`/book/${f._id}`}>Book this facility</Link>
          : <Link className="btn" to="/login" state={{ from: `/book/${f._id}` }}>Log in to book</Link>
      ) : <p className="empty">This facility is currently closed for bookings.</p>}
    </div>
  );
}
