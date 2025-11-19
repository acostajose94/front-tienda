import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Mail, CheckCircle } from 'lucide-react';

const verifySchema = z.object({
  code: z.string().length(6, 'El código debe tener 6 dígitos'),
});

type VerifyFormData = z.infer<typeof verifySchema>;

export function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
  });

  useEffect(() => {
    if (!email) {
      navigate('/register-customer');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const onSubmit = async (data: VerifyFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.verifyEmail(email, data.code);

      // Store the token and user
      localStorage.setItem('token', response.token);

      // Update auth store
      useAuthStore.setState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
      });

      // Show success message
      alert('¡Email verificado exitosamente! Bienvenido a la tienda.');
      navigate('/shop');
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.response?.data?.message || 'Código de verificación inválido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    try {
      await authService.resendVerificationCode(email);
      setCanResend(false);
      setCountdown(60); // 60 seconds cooldown
      alert('Código reenviado exitosamente. Por favor revisa tu email.');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al reenviar el código');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Mail className="mx-auto h-16 w-16 text-primary-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verifica tu Email</h2>
          <p className="mt-2 text-sm text-gray-600">
            Hemos enviado un código de 6 dígitos a:
          </p>
          <p className="mt-1 text-base font-semibold text-primary-600">
            {email}
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Por favor ingresa el código de verificación que recibiste por email
              </p>

              <Input
                label="Código de Verificación"
                type="text"
                maxLength={6}
                {...register('code')}
                error={errors.code?.message}
                placeholder="123456"
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              <CheckCircle size={20} />
              Verificar Email
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                ¿No recibiste el código?
              </p>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={!canResend}
                className={`text-sm font-medium ${
                  canResend
                    ? 'text-primary-600 hover:text-primary-500'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                {canResend ? (
                  'Reenviar código'
                ) : (
                  `Reenviar en ${countdown}s`
                )}
              </button>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/register-customer')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Usar un email diferente
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
