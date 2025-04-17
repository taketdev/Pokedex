const pokemonContainer = document.getElementById('pokemon_container');
const loadedPokemon = [];

async function loadAndRenderPokemons() {
  const limit = 25;
  const offset = loadedPokemons.length;  // überspringe schon geladene Pokémon

  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
  );
  const data = await response.json();

  for (const p of data.results) {
    const poke = await fetch(p.url).then(res => res.json());
    loadedPokemons.push(poke);

    const name = poke.name;
    const id   = poke.id;
    const img  = poke.sprites.other['official-artwork'].front_default;
    const t1   = poke.types[0]?.type.name;
    const t2   = poke.types[1]?.type.name || '';

    // Karte anhängen
    document.getElementById('pokemon_container').innerHTML += `
      <div class="pokemon_card" onclick="showOverlay(${loadedPokemons.length - 1})">
        <img src="${img}" alt="${name}" class="pokemon_img">
        <p class="pokemon_number">N° ${id}</p>
        <h2 class="pokemon_name">${name}</h2>
        <div class="pokemon_types">
          <span class="type ${t1}">${t1}</span>
          ${ t2 ? `<span class="type ${t2}">${t2}</span>` : '' }
        </div>
      </div>
    `;
  }
}


// Neue Funktion fürs Nachladen
async function loadMore() {
  const btn = document.getElementById('load_more_button');
  btn.disabled   = true;
  btn.innerText  = 'Lädt…';

  await loadAndRenderPokemons();

  btn.disabled   = false;
  btn.innerText  = 'Mehr Pokémon laden';
}

loadAndRenderPokemons();