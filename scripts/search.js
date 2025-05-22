let allPokemonList = [];

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const container = document.getElementById('pokemon_container');

async function loadAllPokemonNames() {
  allPokemonList = await fetchPokemons(1000, 0);
}

function renderList(pokemons) {
  container.innerHTML = '';
  pokemons.forEach(poke => {
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

function setLoadMoreVisible(visible) {
  const loadMoreButton = document.getElementById('load_more_button');
  loadMoreButton.style.display = visible && searchInput.value.trim().length === 0 ? 'block' : 'none';
}

async function handleSearch() {
  const q = searchInput.value.trim().toLowerCase();

  if (q.length >= 3) {
    setLoadMoreVisible(false);
    toggleLoading(true);
    const urls = getMatches(q);

    if (urls.length === 0) {
      container.innerHTML = '<p style="text-align: center; margin-top: 20px;">No Pokémon found.</p>';
      toggleLoading(false);
      return;
    }

    const results = await fetchDetails(urls);
    searchResults = results; // Speichere nur in searchResults

    container.innerHTML = ''; // Leere den Container
    results.forEach((poke, index) => {
      container.innerHTML += renderCardTemplate(poke, index);
    });
    toggleLoading(false);
  } else if (q.length === 0) {
    // Render nur loadedPokemons bei leerer Suche
    container.innerHTML = '';
    loadedPokemons.forEach((poke, index) => {
      container.innerHTML += renderCardTemplate(poke, index);
    });
    setLoadMoreVisible(true);
  }
}

async function setup() {
  await loadAllPokemonNames();
}

setup();
