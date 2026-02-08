async function loadWordOfDay() {
  const { data } = await supabase
    .from("daily_word")
    .select("*")
    .single();

  document.getElementById("word").textContent = data.word;
  document.getElementById("meaning").textContent = data.meaning;
}

loadWordOfDay();
