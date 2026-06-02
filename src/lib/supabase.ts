import { createClient } from '@supabase/supabase-js';
import { SavedSimulation, SavedDiet } from '../types';

const supabaseUrl = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Dual-persistence utility that syncs with Supabase if online/logged-in, otherwise localStorage
export interface UserProfile {
  email: string;
  isDemo: boolean;
}

export async function supabaseSignUp(email: string, password: string) {
  if (!isSupabaseConfigured || !supabase) {
    // If not configured, mock success for local sandbox
    const users = JSON.parse(localStorage.getItem('simuboi_mock_users') || '{}');
    if (users[email]) {
      throw new Error('Este email já está cadastrado.');
    }
    users[email] = password;
    localStorage.setItem('simuboi_mock_users', JSON.stringify(users));
    return { data: { user: { email } }, error: null };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function supabaseSignIn(email: string, password: string) {
  if (!isSupabaseConfigured || !supabase) {
    // If not configured, mock check in local sandbox
    const users = JSON.parse(localStorage.getItem('simuboi_mock_users') || '{}');
    if (users[email] && users[email] === password) {
      return { data: { user: { email } }, error: null };
    }
    throw new Error('E-mail ou senha incorretos, ou chave Supabase não configurada no .env.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function supabaseSignOut() {
  if (!isSupabaseConfigured || !supabase) {
    return { error: null };
  }
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function supabaseResetPassword(email: string) {
  if (!isSupabaseConfigured || !supabase) {
    // Local mock password reset request
    const users = JSON.parse(localStorage.getItem('simuboi_mock_users') || '{}');
    if (!users[email]) {
      throw new Error('E-mail não encontrado no banco de dados local.');
    }
    return { data: null, error: null };
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
  return { data, error };
}

export async function supabaseUpdatePassword(password: string) {
  if (!isSupabaseConfigured || !supabase) {
    // Mock password update
    return { data: null, error: null };
  }
  const { data, error } = await supabase.auth.updateUser({
    password: password
  });
  return { data, error };
}

export async function syncUserDataToSupabase(email: string, simulations: SavedSimulation[], diets: SavedDiet[]) {
  if (!isSupabaseConfigured || !supabase) {
    return false;
  }

  try {
    const sessionResponse = await supabase.auth.getSession();
    const user = sessionResponse.data.session?.user;
    if (!user) return false;

    // We store user simulations and diets in a table `simuboi_user_data`
    // with columns: id (user_id), email, simulations, diets, updated_at
    const { error } = await supabase
      .from('simuboi_user_data')
      .upsert({
        id: user.id,
        email: user.email,
        simulations,
        diets,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase DB Sync error (table simuboi_user_data may not be created yet):', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Failed to sync to Supabase database:', e);
    return false;
  }
}

export async function fetchUserDataFromSupabase(): Promise<{ simulations: SavedSimulation[], diets: SavedDiet[] } | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const sessionResponse = await supabase.auth.getSession();
    const user = sessionResponse.data.session?.user;
    if (!user) return null;

    const { data, error } = await supabase
      .from('simuboi_user_data')
      .select('simulations, diets')
      .eq('id', user.id)
      .single();

    if (error) {
      console.warn('Supabase DB fetch error (table simuboi_user_data may not exist yet):', error.message);
      return null;
    }

    if (data) {
      return {
        simulations: (data.simulations as SavedSimulation[]) || [],
        diets: (data.diets as SavedDiet[]) || []
      };
    }
    return null;
  } catch (e) {
    console.warn('Failed to fetch from Supabase database:', e);
    return null;
  }
}
