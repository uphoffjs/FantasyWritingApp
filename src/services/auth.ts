import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
}

class AuthService {
  async signUp(email: string, password: string, username?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        }
      }
    });
    
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  async resendVerificationEmail(email: string) {
    try {
      // Supabase doesn't have a direct resend verification email method
      // The typical approach is to sign out and sign in again to trigger a new verification email
      // Or use the resend OTP method for email verification
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error resending verification email:', error);
      return { error };
    }
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  }

  async isEmailVerified(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      // Check if email is verified from user metadata
      // Supabase sets email_confirmed_at when email is verified
      return user.email_confirmed_at !== null && user.email_confirmed_at !== undefined;
    } catch (error) {
      console.error('Error checking email verification:', error);
      return false;
    }
  }

  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Profile might not exist yet, which is ok
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  async updateProfile(updates: { username?: string; displayName?: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: updates.username,
        display_name: updates.displayName,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  }
}

export const authService = new AuthService();
export default authService;