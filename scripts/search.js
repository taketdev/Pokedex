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
  const q = searchInput.value.trim().toLowerCase();
  const loadMoreButton = document.getElementById("load_more_button");

  if (q.length >= 3) {
    if (loadMoreButton) {
      loadMoreButton.style.visibility = "hidden";
    }
    toggleLoading(true);
    const urls = getMatches(q);

    if (urls.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; margin-top: 20px;">No Pokémon found.</p>';
      toggleLoading(false);
      if (loadMoreButton) {
        loadMoreButton.style.visibility = "visible";
      }
      return;
    }

    const results = await fetchDetails(urls);
    searchResults = results;

    container.innerHTML = "";
    results.forEach((poke, index) => {
      container.innerHTML += renderCardTemplate(poke, index);
    });
    toggleLoading(false);
  } else if (q.length === 0) {
    container.innerHTML = "";
    loadedPokemons.forEach((poke, index) => {
      container.innerHTML += renderCardTemplate(poke, index);
    });
    if (loadMoreButton) {
      loadMoreButton.style.visibility = "visible";
    }
  }
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
