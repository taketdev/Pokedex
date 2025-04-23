// 1. Referenzen auf Input und Button
const searchInput  = document.querySelector('.searchInput');
const searchButton = document.querySelector('.searchButton');

// 2. Hilfsfunktion zum (re-)Rendern einer Liste von Pokémon
function renderList(pokemons) {
  pokemonContainer.innerHTML = '';
  pokemons.forEach((poke, i) => {
    pokemonContainer.innerHTML += `
      <div class="pokemon_card" onclick="showOverlay(${loadedPokemons.indexOf(poke)})">
        <img src="${poke.sprites.other['official-artwork'].front_default}" class="pokemon_img">
        <p class="pokemon_number">N° ${poke.id}</p>
        <h2 class="pokemon_name">${poke.name}</h2>
        <div class="pokemon_types">
          <span class="type ${poke.types[0].type.name}">${poke.types[0].type.name}</span>
          ${poke.types[1]?`<span class="type ${poke.types[1].type.name}">${poke.types[1].type.name}</span>`:``}
        </div>
      </div>`;
  });
}

// 3. Filter-Logik, ab 3 Zeichen suchen, bei 0 Zeichen alles anzeigen
function handleSearch() {
  const q = searchInput.value.trim().toLowerCase();
  if (q.length >= 3) {
    const filtered = loadedPokemons.filter(p => p.name.toLowerCase().includes(q));
    renderList(filtered);
  }
  else if (q.length === 0) {
    renderList(loadedPokemons);
  }
}

// 4. Events binden
searchInput.addEventListener('input',  handleSearch);
searchButton.addEventListener('click', handleSearch);
