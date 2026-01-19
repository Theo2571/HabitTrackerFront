import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import './AuthForm.css';

interface AuthFormProps {
  title: string;
  onSubmit: (username: string, password: string) => Promise<void>;
  linkText: string;
  linkTo: string;
  linkLabel: string;
  error?: string;
  loading?: boolean;
}

export const AuthForm = ({
  title,
  onSubmit,
  linkText,
  linkTo,
  linkLabel,
  error,
  loading = false,
}: AuthFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(username, password);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{title}</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={title === 'Login' ? 'current-password' : 'new-password'}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Processing...' : title}
          </button>
        </form>
        <p className="auth-link">
          {linkText} <Link to={linkTo}>{linkLabel}</Link>
        </p>
      </div>
    </div>
  );
};

