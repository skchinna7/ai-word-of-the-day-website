const SUPABASE_URL = "https://vikzesimclynhzhavdrl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpa3plc2ltY2x5bmh6aGF2ZHJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MTcyNDgsImV4cCI6MjA4NTM5MzI0OH0.k44Eibz2i7VD2rA-JGZu_v0s3t3ruKdxHr6qZx-U1MQ";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

async function saveWord() {
  const word = document.getElementById("word").value;
  const phonetic = document.getElementById("phonetic").value;
  const definition = document.getElementById("definition").value;

  const { error } = await supabase
    .from("words")
    .insert([{ word, phonetic, definition }]);

  document.getElementById("status").textContent =
    error ? error.message : "Saved successfully!";
}
