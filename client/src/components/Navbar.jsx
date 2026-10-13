import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="nav">
      <Link to="/" className="brand"><span className="ball" />CourtBook</Link>
      <nav>
        <NavLink to="/facilities">Facilities</NavLink>
        {user && !isAdmin && <NavLink to="/my-bookings">My bookings</NavLink>}
        {isAdmin && <NavLink to="/admin">Admin</NavLink>}
        {user ? (
          <>
            <span className="who">{user.name}</span>
            <button className="btn ghost light small" onClick={() => { logout(); navigate('/'); }}>Log out</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <Link to="/register" className="btn volt small">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
