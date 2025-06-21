import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/authSlice';
import type { RootState } from '@/store';
import api from '@/lib/axios';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      const res = await api.post('/auth/login', form);
      dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
      toast.success('Logged in successfully!');
      navigate({ to: '/dashboard' });
    } catch (err: any) {
      dispatch(loginFailure(err.response?.data?.message || 'Login failed'));
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-w-md mx-auto mt-10 p-6 border rounded-lg shadow"
    >
      <h2 className="text-xl font-bold text-center">Login</h2>

      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="p-2 border rounded"
        required
      />

      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
        className="p-2 border rounded"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="p-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      
    </form>
  );
};

export default Login;
