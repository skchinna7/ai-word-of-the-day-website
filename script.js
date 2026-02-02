import { supabase } from "./supabaseClient.js";

const container = document.getElementById("word-container");

async function fetchOldestWord() {
  const { data, error } = await supabase
    .from("meanings")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1);

  if (error) {
    container.innerHTML = `<p>Error fetching word: ${error.message}</p>`;
    console.error(error);
    return;
  }

  if (data.length === 0) {
    container.innerHTML = "<p>No words found.</p>";
    return;
  }

  const word = data[0];
  container.innerHTML = `
    <h2>${word.word}</h2>
    <p>${word.meaning}</p>
  `;
}

fetchOldestWord();