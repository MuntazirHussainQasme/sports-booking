import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errorText } from '../api';
import FacilityCard from '../components/FacilityCard';

export default function Facilities() {
  const [params, setParams] = useSearchParams();
  const sport = params.get('sport') || '';
  const [q, setQ] = useState('');
  const [all, setAll] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { api.get('/facilities').then((r) => setAll(r.data)).catch(() => {}); }, []);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api.get('/facilities', { params: { sport: sport || undefined, q: q || undefined } })
        .then((r) => { setList(r.data); setError(''); }).catch((e) => setError(errorText(e))).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [sport, q]);

  const sports = [...new Set(all.map((f) => f.sportType))];
  return (
    <div className="page">
      <h1>Facilities</h1>
      <div className="filters">
        <input placeholder="Search by name or location" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={sport} onChange={(e) => (e.target.value ? setParams({ sport: e.target.value }) : setParams({}))}>
          <option value="">All sports</option>{sports.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {error && <p className="err">{error}</p>}
      {loading && list.length === 0 && <p className="muted">Loading…</p>}
      {!loading && list.length === 0 && !error && <p className="empty">No facilities match. Try a different sport or search.</p>}
      <div className="grid">{list.map((f) => <FacilityCard key={f._id} facility={f} />)}</div>
    </div>
  );
}
