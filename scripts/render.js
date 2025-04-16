const pokemonContainer = document.getElementById('pokemon_container');

async function loadAndRenderPokemons() {
  const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=25');
  const data = await response.json();

  for (const p of data.results) {
    const poke = await fetch(p.url).then(res => res.json());
    const name = poke.name;
    const id = poke.id;
    const img = poke.sprites.other['official-artwork'].front_default;
    const type1 = poke.types[0]?.type.name;
    const type2 = poke.types[1]?.type.name;

    pokemonContainer.innerHTML += `
      <div class="pokemon_card data-index="${loadedPokemons.length - 1}">
        <img src="${img}" alt="${name}" class="pokemon_img">
        <p class="pokemon_number">N° ${id}</p>
        <h2 class="pokemon_name">${name}</h2>
        <div class="pokemon-types">
          <span class="type ${type1}">${type1}</span>
          ${type2 ? `<span class="type ${type2}">${type2}</span>` : ''}
        </div>
      </div>
    `;
  }
}

loadAndRenderPokemons();
