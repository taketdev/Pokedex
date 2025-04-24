let allPokemonList = [];
const searchInput = document.querySelector('.searchInput');
const searchButton = document.querySelector('.searchButton');
const container = document.getElementById('pokemon_container');

async function loadAllPokemonNames() {
  allPokemonList = await fetchPokemons(100000, 0);
}

function renderList(pokemons) {
  container.innerHTML = '';
  pokemons.forEach(poke => {
    const idx = loadedPokemons.indexOf(poke);
    if (idx === -1) loadedPokemons.push(poke);
    container.innerHTML += renderCardTemplate(poke, loadedPokemons.indexOf(poke));
  });
}

function getMatches(query) {
  return allPokemonList
    .filter(p => p.name.includes(query))
    .slice(0, 30)
    .map(p => p.url);
}

async function fetchDetails(urls) {
  return Promise.all(urls.map(u => fetch(u).then(r => r.json())));
}

async function handleSearch() {
  const q = searchInput.value.trim().toLowerCase();
  if (q.length >= 3) {
    toggleLoading?.(true);
    const urls = getMatches(q);
    const results = await fetchDetails(urls);
    renderList(results);
    toggleLoading?.(false);
  } else if (q.length === 0) {
    renderList(loadedPokemons);
  }
}

function setup() {
  loadAllPokemonNames();
  searchInput.addEventListener('input', handleSearch);
  searchButton.addEventListener('click', handleSearch);
}

setup();
