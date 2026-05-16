import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import KurukhDictionaryLogo from '../components/logo/KurukhDictionaryLogo';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password should be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setError('');
      setLoading(true);
      const result = await register(formData.email, formData.password, formData.username);
      if (result.success) navigate('/');
      else throw new Error(result.error || 'Failed to create an account');
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to create an account. ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      const result = await loginWithGoogle();
      if (result.success) navigate('/');
      else throw new Error(result.error || 'Failed to sign up with Google');
    } catch (err) {
      console.error('Google sign up error:', err);
      setError('Failed to sign up with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="flex justify-center mb-8">
        <KurukhDictionaryLogo size="md" />
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label"><span className="label-text">Username</span></label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control mb-4">
            <label className="label"><span className="label-text">Email</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control mb-4">
            <label className="label"><span className="label-text">Password</span></label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
            <label className="label">
              <span className="label-text-alt">Must be at least 6 characters</span>
            </label>
          </div>

          <div className="form-control mb-6">
            <label className="label"><span className="label-text">Confirm Password</span></label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Register'}
          </button>
        </form>

        <div className="divider my-6">OR</div>

        <button
          onClick={handleGoogleLogin}
          className="btn btn-outline w-full flex items-center justify-center gap-2"
          disabled={loading}
        >
          Sign up with Google
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
