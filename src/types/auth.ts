// Authentication-related type definitions

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  surname?: string;
  is_admin?: boolean;
  receive_emails?: boolean;
  gdpr_consent?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  surname?: string;
  receiveEmails?: boolean;
  gdprConsent?: boolean;
}

export interface SignInFormData {
  email: string;
  password: string;
}