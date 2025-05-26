let allPokemonList = [];

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const container = document.getElementById("pokemon_container");

async function loadAllPokemonNames() {
  allPokemonList = await fetchPokemons(1000, 0);
}

function renderList(pokemons) {
  container.innerHTML = "";
  pokemons.forEach((poke) => {
    container.innerHTML += renderCardTemplate(
      poke,
      loadedPokemons.indexOf(poke)
    );
  });
}

function getMatches(query) {
  return allPokemonList
    .filter((p) => p.name.includes(query))
    .slice(0, 30)
    .map((p) => p.url);
}

async function fetchDetails(urls) {
  return Promise.all(urls.map((u) => fetch(u).then((r) => r.json())));
}

function setLoadMoreVisible(visible) {
  const loadMoreButton = document.getElementById("load_more_button");
}

async function handleSearch() {
  const q = getQuery();
  toggleLoadMore(q);
  toggleLoading(q.length >= 3);

  if (q.length < 3) return showDefaultOrShort(q);

  const matches = getMatches(q);
  if (!matches.length) return showNoResults();

  const list = await fetchDetails(matches);
  renderList(list);
}

function getQuery() {
  let input = document.getElementById("search_input") 
    || document.getElementById("searchInput")
    || (typeof window.searchInput !== 'undefined' && window.searchInput);
  if (input && typeof input.value === 'string') {
    return input.value.trim().toLowerCase();
  }
  return "";
}

function toggleLoadMore(q) {
  const btn = document.getElementById("load_more_button");
  if (!btn) return;
  btn.style.visibility = q ? "hidden" : "visible";
}

function showDefaultOrShort(q) {
  if (!q.length) {
    container.innerHTML = loadedPokemons
      .map((p, i) => renderCardTemplate(p, i))
      .join('');
  }
  toggleLoading(false);
}

function showNoResults() {
  container.innerHTML = '<p style="text-align:center;margin-top:20px;">No Pokémon found.</p>';
  toggleLoading(false);
}

function renderList(list) {
  searchResults = list;
  container.innerHTML = list
    .map((p, i) => renderCardTemplate(p, i))
    .join('');
  toggleLoading(false);
}

async function setup() {
  await loadAllPokemonNames();
  setLoadMoreVisible(true);
}

function clearSearchInput() {
  const searchInput = document.getElementById("searchInput");
  searchInput.value = "";
  handleSearch();
}

document.getElementById("searchInput").addEventListener("input", function () {
  const clearButton = document.getElementById("clearSearch");
  clearButton.style.display = this.value.length > 0 ? "block" : "none";
});

setup();
