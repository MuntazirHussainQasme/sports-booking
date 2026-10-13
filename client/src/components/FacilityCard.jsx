import { Link } from 'react-router-dom';
import { money, fmtTime } from '../api';

const TONES = ['#1d4ed8', '#0f766e', '#7c3aed', '#be185d', '#b45309', '#0e7490'];
const tone = (s) => TONES[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];

export default function FacilityCard({ facility: f }) {
  return (
    <Link to={`/facilities/${f._id}`} className={`fcard ${f.isActive ? '' : 'off'}`}>
      <div className="fcard-art" style={{ background: tone(f.sportType) }}>
        <span>{f.sportType}</span>
        {!f.isActive && <em>Inactive</em>}
      </div>
      <div className="fcard-body">
        <h3>{f.name}</h3>
        <p className="muted">{f.location}</p>
        <p className="muted">Open {fmtTime(f.openTime)} to {fmtTime(f.closeTime)}</p>
        <p className="price"><b>{money(f.pricePerHour)}</b> / hour</p>
      </div>
    </Link>
  );
}
