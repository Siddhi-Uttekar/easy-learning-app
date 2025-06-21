import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useNavigate } from '@tanstack/react-router';

// Zod schema for validation
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
  .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[a-z]/, 'Must include a lowercase letter')
    .regex(/[0-9]/, 'Must include a number')
    .regex(/[!@#$%^&*]/, 'Must include a special character'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await api.post('/auth/register', data);
      toast.success('Registered successfully! Please login.');
      navigate({ to: '/login' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 max-w-md mx-auto mt-10 p-6 border rounded-lg shadow"
    >
      <h2 className="text-xl font-bold text-center">Register</h2>

      <input
        type="text"
        placeholder="Full Name"
        {...register('name')}
        className="p-2 border rounded"
      />
      {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

      <input
        type="email"
        placeholder="Email"
        {...register('email')}
        className="p-2 border rounded"
      />
      {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

      <input
        type="password"
        placeholder="Password"
        {...register('password')}
        className="p-2 border rounded"
      />
      {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="p-2 bg-green-600 text-white rounded disabled:opacity-50"
      >
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default Register;
