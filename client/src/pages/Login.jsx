import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorText } from '../api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Enter your email and password');
    try { const u = await login(form.email, form.password); navigate(location.state?.from || (u.role === 'admin' ? '/admin' : '/facilities'), { replace: true }); }
    catch (err) { setError(errorText(err)); }
  };

  return (
    <div className="page narrow">
      <form className="panel stack" onSubmit={submit} noValidate>
        <h1>Log in</h1>
        <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        {error && <p className="err">{error}</p>}
        <button className="btn">Log in</button>
        <p className="muted">New here? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}
