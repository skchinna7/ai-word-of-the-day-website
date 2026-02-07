const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
app.use(express.static('public'));
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.get('/api/define/:word', async (req, res) => {
  const word = req.params.word.toLowerCase();
  
  // Supabase cache check
  const { data } = await supabase
    .from('dictionary')
    .select('data')
    .eq('word', word)
    .single();
    
  if (data) return res.json(data.data);
  
  // Free Dictionary API
  const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
  const dictData = await dictRes.json();
  
  if (dictData[0]) {
    const result = dictData[0];
    await supabase.from('dictionary').upsert({ word, data: result });
    res.json(result);
  } else {
    res.json({ error: 'Word not found' });
  }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.listen(process.env.PORT || 3000);
