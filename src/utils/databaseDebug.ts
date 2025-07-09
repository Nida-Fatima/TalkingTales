import { supabase } from '../lib/supabase';

export async function debugUserTables() {
  try {
    console.log('=== DATABASE DEBUG INFO ===');
    
    // Check public users table
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('*');
    console.log('Public users:', publicUsers?.length || 0);
    if (publicError) console.error('Public users error:', publicError);
    
    // Check current session
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    console.log('Current session:', session?.session?.user?.id || 'No session');
    if (sessionError) console.error('Session error:', sessionError);
    
    // Check if we can insert a test record (this will help identify RLS issues)
    if (session?.session?.user) {
      const { error: testError } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.session.user.id)
        .maybeSingle();
      
      if (testError) {
        console.error('RLS test error:', testError);
      } else {
        console.log('RLS test passed');
      }
    }
    
    console.log('=== END DEBUG INFO ===');
  } catch (error) {
    console.error('Debug function error:', error);
  }
}

export async function createUserProfileManually(userId: string, email: string, username: string) {
  try {
    console.log('Manually creating user profile...');
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        username,
        target_languages: ['de'],
      })
      .select()
      .single();
    
    if (error) {
      console.error('Manual profile creation error:', error);
      return { success: false, error };
    } else {
      console.log('Manual profile creation success:', data);
      return { success: true, data };
    }
  } catch (error) {
    console.error('Manual profile creation exception:', error);
    return { success: false, error };
  }
}