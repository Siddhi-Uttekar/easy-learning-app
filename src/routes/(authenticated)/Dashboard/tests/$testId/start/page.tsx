import { useNavigate, useParams } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { authService } from '@/service/authService';

export default function StartTest() {
  const { testId } = useParams({ from: '/(authenticated)/Dashboard/tests/$testId/start' });
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const user = authService.getUserFromToken();
      if (!user || !user.id) {
        toast.error('User not found or invalid. Please re-login.');
        setLoading(false);
        return;
      }
      // Use id as per backend requirement; if your API needs studentId (int), use that:
      const res = await api.post(`/tests/${testId}/attempt`, {
        studentId: Number(user.id),
        // If your API expects studentEmail instead, uncomment the next line and comment the above
        // studentEmail: user.email,
      });
      const { attemptId } = res.data;
      navigate({ to: `/Dashboard/tests/attempts/${attemptId}` });
    } catch (e) {
      toast.error('Could not start attempt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Button onClick={handleStart} disabled={loading} size="lg">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Start Test
      </Button>
    </div>
  );
}