export type RegisterRole = 'CLIENT' | 'MASTER';

export interface RegisterFormValues {
  email: string;
  phone: string;
  password: string;
  acceptedLegal: boolean;
  acceptedAge: boolean;
  role: RegisterRole;
  firstName?: string;
  lastName?: string;
  city?: string;
  category?: string;
  description?: string;
}

export { useRegistrationForm } from './useRegistrationForm';
