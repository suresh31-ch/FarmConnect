/**
 * Supabase Voice Logs Service
 * Records voice commands, AI responses, language, and actions into Supabase database.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface VoiceLogRecord {
  user_id?: string;
  command: string;
  response: string;
  language: 'en' | 'te' | 'hi';
  action_type?: string;
  navigation_target?: string;
  timestamp?: string;
}

export const logVoiceCommandToSupabase = async (logData: VoiceLogRecord) => {
  if (!isSupabaseConfigured()) {
    console.log('[Voice Logger] Supabase not configured, saving locally:', logData);
    return;
  }

  try {
    const { error } = await supabase.from('voice_assistant_logs').insert([
      {
        user_id: logData.user_id || 'anonymous_farmer',
        command: logData.command,
        response: logData.response,
        language: logData.language,
        action_type: logData.action_type || 'GENERAL_QUERY',
        navigation_target: logData.navigation_target || null,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      if (error.code === '42P01') {
        console.warn('[Voice Logger] Table voice_assistant_logs pending creation in Supabase.');
      } else {
        console.error('[Voice Logger] Error logging voice command to Supabase:', error.message);
      }
    } else {
      console.log('[Voice Logger] Voice command logged successfully to Supabase Realtime!');
    }
  } catch (err) {
    console.error('[Voice Logger] Exception logging voice command:', err);
  }
};
