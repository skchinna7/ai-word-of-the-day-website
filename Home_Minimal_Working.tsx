import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const Home: React.FC = () => {
  const [word, setWord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWord();
  }, []);

  const loadWord = async () => {
    try {
      console.log('🔍 Checking Supabase configuration...');
      console.log('Supabase configured:', isSupabaseConfigured);
      
      if (!isSupabaseConfigured || !supabase) {
        // Show fallback word if Supabase not configured
        setWord({
          word: 'self-care',
          pronunciation: 'self ker',
          part_of_speech: 'noun',
          meaning: 'the practice of taking action to preserve or improve one\'s own health.',
          example: 'Taking time for self-care is essential for mental wellbeing.',
        });
        setLoading(false);
        console.warn('⚠️ Using fallback word - Supabase not configured');
        setError('Demo mode - Connect Supabase to use live data');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      console.log('📅 Fetching word for date:', today);

      const { data, error: fetchError } = await supabase
        .from('words')
        .select('*')
        .eq('scheduled_date', today)
        .eq('status', 'approved')
        .single();

      if (fetchError) {
        console.error('❌ Error fetching word:', fetchError);
        // Show fallback word on error
        setWord({
          word: 'self-care',
          pronunciation: 'self ker',
          part_of_speech: 'noun',
          meaning: 'the practice of taking action to preserve or improve one\'s own health.',
          example: 'Taking time for self-care is essential for mental wellbeing.',
        });
        setError('Using demo word - check database connection');
      } else if (data) {
        console.log('✅ Word loaded:', data);
        setWord(data);
      } else {
        console.warn('⚠️ No word found for today');
        // Show fallback word if no word for today
        setWord({
          word: 'serendipity',
          pronunciation: 'ser-ən-ˈdi-pə-tē',
          part_of_speech: 'noun',
          meaning: 'the occurrence of events by chance in a happy or beneficial way.',
          example: 'Finding this perfect café was pure serendipity.',
        });
        setError('No word scheduled for today - showing demo word');
      }
    } catch (err: any) {
      console.error('❌ Unexpected error:', err);
      setError('Error loading word: ' + err.message);
      // Always show something, never blank screen
      setWord({
        word: 'resilience',
        pronunciation: 'ri-ˈzil-yən(t)s',
        part_of_speech: 'noun',
        meaning: 'the capacity to recover quickly from difficulties; toughness.',
        example: 'Her resilience in the face of adversity was truly inspiring.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl">Loading word of the day...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Error banner if any */}
      {error && (
        <div className="bg-yellow-900/20 border-b border-yellow-600 px-4 py-2">
          <p className="text-yellow-300 text-sm text-center">⚠️ {error}</p>
        </div>
      )}

      {/* Main content */}
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto">
          {/* Word */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif mb-8 tracking-tight">
            {word?.word || 'Word of the Day'}
          </h1>

          {/* Pronunciation */}
          {word?.pronunciation && (
            <p className="text-2xl md:text-3xl text-gray-400 mb-4 font-light italic">
              /{word.pronunciation}/ {word.part_of_speech || 'noun'}
            </p>
          )}

          {/* Meaning */}
          <p className="text-xl md:text-2xl text-gray-200 leading-relaxed font-light max-w-3xl mb-12">
            {word?.meaning || 'Loading meaning...'}
          </p>

          {/* Example */}
          {word?.example && (
            <div className="pt-8 border-t border-gray-700">
              <p className="text-lg md:text-xl text-gray-400 italic">
                "{word.example}"
              </p>
            </div>
          )}

          {/* Debug info (remove in production) */}
          <div className="mt-16 pt-8 border-t border-gray-800 text-xs text-gray-600">
            <p>Debug Info:</p>
            <p>• Supabase: {isSupabaseConfigured ? '✅ Connected' : '❌ Not configured'}</p>
            <p>• Date: {new Date().toLocaleDateString()}</p>
            <p>• Environment: {import.meta.env.MODE}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 text-center text-gray-600 text-sm">
        <p>Word of the Day • {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default Home;
