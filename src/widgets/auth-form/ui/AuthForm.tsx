import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import styles from './AuthForm.module.css';

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
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>{title}</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
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
          <div className={styles.formGroup}>
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
          {error && <div className={styles.errorMessage}>{error}</div>}
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? (
              <>
                <span className={styles.spinner} aria-hidden />
                {title === 'Login' ? 'Signing in...' : 'Creating account...'}
                <span className={styles.loadingLine} aria-hidden />
              </>
            ) : (
              title
            )}
          </button>
        </form>
        <p className={styles.link}>
          {linkText} <Link to={linkTo}>{linkLabel}</Link>
        </p>
      </div>
    </div>
  );
};

