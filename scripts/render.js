async function fetchPokemons(limit, offset) {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
  );
  const data = await response.json();
  return data.results;
}

function renderCardTemplate(poke, index) {
  const { name, id, sprites, types } = poke;
  const img = sprites.other['official-artwork'].front_default;
  const [t1 = '', t2 = ''] = types.map(t => t.type.name);

  return `
    <div class="pokemon_card" onclick="showOverlay(${index})">
      <img src="${img}" alt="${name}" class="pokemon_img">
      <p class="pokemon_number">N° ${id}</p>
      <h2 class="pokemon_name">${name}</h2>
      <div class="pokemon_types">
        <span class="type ${t1}">${t1}</span>
        ${t2 ? `<span class="type ${t2}">${t2}</span>` : ''}
      </div>
    </div>
  `;
}

async function loadAndRenderPokemons() {
  const container = document.getElementById('pokemon_container');
  const limit = 5;
  const offset = loadedPokemons.length;
  const results = await fetchPokemons(limit, offset);

  for (const { url } of results) {
    const poke = await fetch(url).then(res => res.json());
    loadedPokemons.push(poke);
    container.innerHTML += renderCardTemplate(poke, loadedPokemons.length - 1);
  }
}

async function loadMore() {
  const loader = document.getElementById('pokemon_loader');
  const btn    = document.getElementById('load_more_button');

  loader.style.display = 'flex';
  btn.disabled          = true;
  btn.innerText         = 'Lädt…';

  await loadAndRenderPokemons();

  btn.disabled          = false;
  btn.innerText         = 'Mehr Pokémon laden';
  loader.style.display  = 'none';
}

loadAndRenderPokemons();
