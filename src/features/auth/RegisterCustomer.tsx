import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/services/auth.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { UserPlus, Mail } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterCustomer() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.registerCustomer({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });

      setRegisteredEmail(data.email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'Error al registrarse. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Mail className="mx-auto h-16 w-16 text-green-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">¡Registro Exitoso!</h2>
          </div>

          <Card>
            <div className="text-center space-y-4">
              <p className="text-gray-700">
                Hemos enviado un código de verificación a:
              </p>
              <p className="text-lg font-semibold text-primary-600">
                {registeredEmail}
              </p>
              <p className="text-sm text-gray-600">
                Por favor revisa tu bandeja de entrada y sigue las instrucciones para verificar tu cuenta.
              </p>
              <div className="pt-4">
                <Button
                  onClick={() => navigate(`/verify-email?email=${encodeURIComponent(registeredEmail)}`)}
                  className="w-full"
                >
                  Verificar Email Ahora
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                ¿No recibiste el código?{' '}
                <button
                  onClick={async () => {
                    try {
                      await authService.resendVerificationCode(registeredEmail);
                      alert('Código reenviado exitosamente');
                    } catch (error) {
                      alert('Error al reenviar el código');
                    }
                  }}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Reenviar código
                </button>
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <UserPlus className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Crea tu Cuenta</h2>
          <p className="mt-2 text-sm text-gray-600">
            Regístrate para empezar a comprar
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                type="text"
                {...register('firstName')}
                error={errors.firstName?.message}
                placeholder="Juan"
              />

              <Input
                label="Apellido"
                type="text"
                {...register('lastName')}
                error={errors.lastName?.message}
                placeholder="Pérez"
              />
            </div>

            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="correo@ejemplo.com"
            />

            <Input
              label="Teléfono (opcional)"
              type="tel"
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="+1 234 567 890"
            />

            <Input
              label="Contraseña"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="••••••••"
              helperText="Mínimo 6 caracteres"
            />

            <Input
              label="Confirmar Contraseña"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              placeholder="••••••••"
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                Acepto los{' '}
                <a href="/terms" className="text-primary-600 hover:text-primary-500">
                  términos y condiciones
                </a>
              </label>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Crear Cuenta
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Inicia sesión aquí
                </button>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
