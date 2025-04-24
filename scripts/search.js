const searchInput  = document.querySelector('.searchInput');
const searchButton = document.querySelector('.searchButton');
const container    = document.getElementById('pokemon_container');

function renderList(pokemons) {
  container.innerHTML = '';
  pokemons.forEach(poke => {
    const idx = loadedPokemons.indexOf(poke);
    container.innerHTML += renderCardTemplate(poke, idx);
  });
}

function handleSearch() {
  const query = searchInput.value.trim().toLowerCase();

  if (query.length >= 3) {
    const filtered = loadedPokemons.filter(p => p.name.toLowerCase().includes(query));
    renderList(filtered);
  } else if (query.length === 0) {
    renderList(loadedPokemons);
  }
}

searchInput.addEventListener('input',  handleSearch);
searchButton.addEventListener('click', handleSearch);
