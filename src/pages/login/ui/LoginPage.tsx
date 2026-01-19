import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../../../widgets/auth-form';
import { useLoginMutation } from '../../../features/auth/model/useAuthMutations';

export const LoginPage = () => {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const [error, setError] = useState('');

  const handleLogin = async (username: string, password: string) => {
    setError('');
    try {
      await loginMutation.mutateAsync({ username, password });
      navigate('/tasks');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <AuthForm
      title="Login"
      onSubmit={handleLogin}
      linkText="Don't have an account?"
      linkTo="/register"
      linkLabel="Register"
      error={error}
      loading={loginMutation.isPending}
    />
  );
};

