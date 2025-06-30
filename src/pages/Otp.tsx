import { useSearch } from '@tanstack/react-router';
import { Route } from '@/routes/(auth)/otp';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { authService } from '@/service/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, KeyRound, ArrowRight, Mail, Shield, Clock, CheckCircle } from 'lucide-react';

const Otp = () => {
  const search = useSearch({ from: Route.id });
  const email = search.email;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { isNewUser } = await authService.verifyOtp(email, otp);

      toast.success('Logged in successfully!');

      if (isNewUser) {
        navigate({ to: '/profile' });
      } else {
        navigate({ to: '/Dashboard' });
      }

    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await authService.sendOtp(email);
      toast.success('OTP resent successfully!');
    } catch (err: any) {
      toast.error('Failed to resend OTP');
    }
  };

  const maskedEmail = email ?
    email.replace(/(.{2})(.*)(@.*)/, (_, first, middle, last) =>
      first + '*'.repeat(middle.length) + last
    ) : '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4 shadow-lg">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify Your Identity</h1>
          <p className="text-gray-600 mt-2">We've sent a secure code to your email</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold text-center">
              Enter Verification Code
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Check your email and enter the 6-digit code below
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Email Display */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Mail className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Code sent to:</p>
                  <p className="text-sm text-gray-600 font-mono">{maskedEmail}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                  Verification Code
                </Label>
                <div className="relative">
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    className="text-center text-lg font-mono tracking-widest h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    maxLength={6}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Enter the 6-digit code from your email
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Code
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Resend Section */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-3">
                Didn't receive the code?
              </p>
              <Button
                variant="outline"
                onClick={handleResendOtp}
                className="text-sm text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
              >
                <Mail className="mr-2 h-4 w-4" />
                Resend Code
              </Button>
            </div>

            {/* Security & Expiry Notice */}
            <div className="mt-6 space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-green-800">
                    <p className="font-medium">Secure Verification</p>
                    <p className="mt-1">This code is unique and encrypted for your security.</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-800">
                    <p className="font-medium">Code Expires Soon</p>
                    <p className="mt-1">Please enter the code within 10 minutes for security.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/' })}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            ← Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Otp;