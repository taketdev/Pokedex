const pokemonContainer = document.getElementById('pokemon_container');
const loadedPokemon = [];

async function loadAndRenderPokemons() {
  const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=25');
  const data = await response.json();

  for (const p of data.results) {
    const poke = await fetch(p.url).then(res => res.json());
    loadedPokemons.push(poke);

    const name = poke.name;
    const id = poke.id;
    const img = poke.sprites.other['official-artwork'].front_default;
    const type1 = poke.types[0]?.type.name;
    const type2 = poke.types[1]?.type.name;

    pokemonContainer.innerHTML += `
    <div class="pokemon_card" onclick="showOverlay(${loadedPokemons.length - 1})">
        <img src="${img}" alt="${name}" class="pokemon_img">
        <p class="pokemon_number">N° ${id}</p>
        <h2 class="pokemon_name">${name}</h2>
        <div class="pokemon-types">
            <span class="type ${type1}">${type1}</span>${type2 ? `<span class="type ${type2}">${type2}</span>` : ''}
        </div>
    </div>
    `;
  }
}

loadAndRenderPokemons();

function showOverlay(index) {
  const poke = loadedPokemons[index];

  const name = poke.name;
  const id = poke.id;
  const img = poke.sprites.other['official-artwork'].front_default;
  const types = poke.types.map(t => t.type.name);
  const height = poke.height / 10 + "m"; // kommt als Dezimeter
  const weight = poke.weight / 10 + "kg"; // kommt als Hektogramm
  const abilities = poke.abilities.map(a => a.ability.name);
  const stats = poke.stats.map(s => s.base_stat);
  const statNames = ['HP', 'ATK', 'DEF', 'SpA', 'SpD', 'SPD'];
  const statHTML = stats.map((val, i) => `
    <div class="stat ${statNames[i].toLowerCase()}"><span>${statNames[i]}</span><strong>${val}</strong></div>
  `).join('');
  const total = stats.reduce((a, b) => a + b, 0);

  const typeHTML = types.map(type => `<span class="type ${type}">${type}</span>`).join('');
  const abilityHTML = abilities.map(a => `<div class="ability">${a}</div>`).join('');

  document.getElementById('pokemon_overlay').innerHTML = `
    <div class="overlay">
      <div class="detail_card">
        <img src="${img}" class="detail_img">
        <p class="pokemon_number">N° ${id}</p>
        <h2 class="pokemon_name">${name}</h2>

        <div class="pokemon_types">
          ${typeHTML}
        </div>

        <h3>Pokedex Entry</h3>
        <p class="entry">Hier könnte ein Eintrag stehen (optional manuell ergänzt)</p>

        <div class="info_section">
          <div class="info_bubble">
            <p class="label">Height</p>
            <p class="value">${height}</p>
          </div>
          <div class="info_bubble">
            <p class="label">Weight</p>
            <p class="value">${weight}</p>
          </div>
        </div>

        <h3>Abilities</h3>
        <div class="info_section">
          ${abilityHTML}
        </div>

        <h3>Stats</h3>
        <div class="stats">
          ${statHTML}
          <div class="stat total"><span>TOT</span><strong>${total}</strong></div>
        </div>

        <h3>Evolution</h3>
        <div class="evolution">
          <div class="evo_stage">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png">
            <p>Lv. 16</p>
          </div>
          <div class="evo_stage">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png">
            <p>Lv. 32</p>
          </div>
          <div class="evo_stage">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png">
            <p>Final</p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('pokemon_overlay').classList.remove('d_none');
}
