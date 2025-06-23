import { useSearch } from '@tanstack/react-router';
import { Route } from '@/routes/(auth)/otp';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { loginSuccess } from '@/store/slices/authSlice';

const Otp = () => {
  const search = useSearch({ from: Route.id });
  const email = search.email;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      const { accessToken, refreshToken, isNewUser } = res.data;

      dispatch(loginSuccess({ accessToken, refreshToken }));

      toast.success('Logged in successfully!');

      setTimeout(() => {
        if (isNewUser) {
          navigate({ to: '/profile' });
        } else {
          navigate({ to: '/dashboard' });
        }
      }, 100);

    }catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-w-md mx-auto mt-10 p-6 border rounded-lg shadow"
    >
      <h2 className="text-xl font-bold text-center">Enter OTP</h2>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        required
        className="p-2 border rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className="p-2 bg-green-600 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>
    </form>
  );
};

export default Otp;
