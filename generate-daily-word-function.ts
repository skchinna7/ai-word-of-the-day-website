// Supabase Edge Function: generate-daily-word
// Path: supabase/functions/generate-daily-word/index.ts
// This function automatically generates a word of the day

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// List of interesting words to use
const WORD_POOL = [
  {
    word: 'Serendipity',
    pronunciation: 'ser-ən-ˈdi-pə-tē',
    part_of_speech: 'noun',
    meaning: 'the practice of taking action to preserve or improve one\'s own health.',
    example: 'Finding this perfect café was pure serendipity.',
  },
  {
    word: 'Ephemeral',
    pronunciation: 'i-ˈfe-mə-rəl',
    part_of_speech: 'adjective',
    meaning: 'lasting for a very short time.',
    example: 'The beauty of cherry blossoms is ephemeral, lasting only a few weeks.',
  },
  {
    word: 'Resilience',
    pronunciation: 'ri-ˈzil-yən(t)s',
    part_of_speech: 'noun',
    meaning: 'the capacity to recover quickly from difficulties; toughness.',
    example: 'Her resilience in the face of adversity was truly inspiring.',
  },
  {
    word: 'Luminous',
    pronunciation: 'ˈlü-mə-nəs',
    part_of_speech: 'adjective',
    meaning: 'full of or shedding light; bright or shining.',
    example: 'The luminous moon lit up the entire night sky.',
  },
  {
    word: 'Eloquent',
    pronunciation: 'ˈe-lə-kwənt',
    part_of_speech: 'adjective',
    meaning: 'fluent or persuasive in speaking or writing.',
    example: 'She gave an eloquent speech that moved everyone in the audience.',
  },
  {
    word: 'Tranquil',
    pronunciation: 'ˈtraŋ-kwəl',
    part_of_speech: 'adjective',
    meaning: 'free from disturbance; calm.',
    example: 'The tranquil lake reflected the mountains perfectly.',
  },
  {
    word: 'Nostalgia',
    pronunciation: 'nä-ˈstal-jə',
    part_of_speech: 'noun',
    meaning: 'a sentimental longing for the past.',
    example: 'Looking at old photos filled her with nostalgia.',
  },
  {
    word: 'Perseverance',
    pronunciation: 'ˌpər-sə-ˈvir-ən(t)s',
    part_of_speech: 'noun',
    meaning: 'continued effort to do or achieve something despite difficulties.',
    example: 'Success requires perseverance and dedication.',
  },
  {
    word: 'Harmony',
    pronunciation: 'ˈhär-mə-nē',
    part_of_speech: 'noun',
    meaning: 'the combination of simultaneously sounded musical notes to produce chords.',
    example: 'The choir sang in perfect harmony.',
  },
  {
    word: 'Wisdom',
    pronunciation: 'ˈwiz-dəm',
    part_of_speech: 'noun',
    meaning: 'the quality of having experience, knowledge, and good judgment.',
    example: 'With age comes wisdom and understanding.',
  },
]

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const today = new Date().toISOString().split('T')[0]
    
    // Check if word already exists for today
    const { data: existingWord } = await supabaseClient
      .from('words')
      .select('*')
      .eq('scheduled_date', today)
      .single()

    if (existingWord) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Word already exists for today',
          word: existingWord 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get a random word from the pool
    const randomWord = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]

    // Insert new word
    const { data, error } = await supabaseClient
      .from('words')
      .insert({
        word: randomWord.word,
        pronunciation: randomWord.pronunciation,
        part_of_speech: randomWord.part_of_speech,
        meaning: randomWord.meaning,
        example: randomWord.example,
        scheduled_date: today,
        status: 'approved',
      })
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Word created successfully',
        word: data 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
