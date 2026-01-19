import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../../../widgets/auth-form';
import { useRegisterMutation } from '../../../features/auth/model/useAuthMutations';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();
  const [error, setError] = useState('');

  const handleRegister = async (username: string, password: string) => {
    setError('');
    try {
      await registerMutation.mutateAsync({ username, password });
      navigate('/tasks');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <AuthForm
      title="Register"
      onSubmit={handleRegister}
      linkText="Already have an account?"
      linkTo="/login"
      linkLabel="Login"
      error={error}
      loading={registerMutation.isPending}
    />
  );
};

