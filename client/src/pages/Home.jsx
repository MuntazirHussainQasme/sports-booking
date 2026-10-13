import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import FacilityCard from '../components/FacilityCard';

export default function Home() {
  const [facilities, setFacilities] = useState([]);
  useEffect(() => { api.get('/facilities').then((r) => setFacilities(r.data)).catch(() => {}); }, []);
  const sports = [...new Set(facilities.map((f) => f.sportType))];

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <h1>Book the court.<br />Skip the phone calls.</h1>
          <p>See which hours are free at grounds, courts and halls near you, and reserve your slot in a minute.</p>
          <div className="row">
            <Link to="/facilities" className="btn volt">Browse facilities</Link>
            <Link to="/register" className="btn ghost light">Create account</Link>
          </div>
        </div>
      </section>

      <div className="page">
        {sports.length > 0 && (
          <section>
            <h2>Sports you can book</h2>
            <div className="row">{sports.map((s) => <Link key={s} className="chip" to={`/facilities?sport=${encodeURIComponent(s)}`}>{s}</Link>)}</div>
          </section>
        )}

        <section>
          <h2>How it works</h2>
          <ol className="steps">
            <li><b>1</b><div><h3>Choose a facility</h3><p className="muted">Filter by sport, check the price and opening hours.</p></div></li>
            <li><b>2</b><div><h3>Pick a date and hours</h3><p className="muted">Free hours are shown live. Taken ones are greyed out, so there are no clashes.</p></div></li>
            <li><b>3</b><div><h3>Get approved</h3><p className="muted">An administrator confirms your request. Track it under My bookings.</p></div></li>
          </ol>
        </section>

        {facilities.length > 0 && (
          <section>
            <div className="head"><h2>Featured facilities</h2><Link to="/facilities">See all</Link></div>
            <div className="grid">{facilities.slice(0, 3).map((f) => <FacilityCard key={f._id} facility={f} />)}</div>
          </section>
        )}
      </div>
    </>
  );
}
