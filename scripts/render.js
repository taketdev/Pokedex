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
    const height = poke.height / 10 + "m";
    const weight = poke.weight / 10 + "kg";
    const abilities = poke.abilities.map(a => a.ability.name);
    const stats = poke.stats.map(s => s.base_stat);
    const statNames = ['HP', 'ATK', 'DEF', 'SpA', 'SpD', 'SPD'];
    const statHTML = stats.map((val, i) => `<div class="stat ${statNames[i].toLowerCase()}"><span>${statNames[i]}</span><strong>${val}</strong></div>`).join('');
    const total = stats.reduce((a, b) => a + b, 0);
    const typeHTML = types.map(type => `<span class="type ${type}">${type}</span>`).join('');
    const abilityHTML = abilities.map(a => `<div class="ability">${a}</div>`).join('');
  
    // 🧪 Zuerst wird nur das Grundgerüst mit Platzhalter geladen
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
          <p class="entry">Hier könnte ein Eintrag stehen</p>
  
          <div class="info_section">
            <div class="info_bubble"><p class="label">Height</p><p class="value">${height}</p></div>
            <div class="info_bubble"><p class="label">Weight</p><p class="value">${weight}</p></div>
          </div>
  
          <h3>Abilities</h3>
          <div class="info_section">${abilityHTML}</div>
  
          <h3>Stats</h3>
          <div class="stats">
            ${statHTML}
            <div class="stat total"><span>TOT</span><strong>${total}</strong></div>
          </div>
  
          <h3>Evolution</h3>
          <div class="evolution">
            <p class="loading">Loading evolution...</p>
          </div>
        </div>
      </div>
    `;

    document.getElementById('pokemon_overlay').classList.remove('d_none');
  
    // 🧠 Dann Evolution asynchron nachladen
    getEvolutionHTML(name).then(evolutionHTML => {
      document.querySelector('.evolution').innerHTML = evolutionHTML;
    });
  }
  
  
async function getEvolutionHTML(pokemonName) {
    const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`);
    const speciesData = await speciesRes.json();
    const evoUrl = speciesData.evolution_chain.url;
  
    const evoRes = await fetch(evoUrl);
    const evoData = await evoRes.json();
  
    const evoStages = [];
  
    let evoChain = evoData.chain;
    while (evoChain) {
      const name = evoChain.species.name;
      const level = evoChain.evolution_details?.[0]?.min_level || null;
      evoStages.push({ name, level });
      evoChain = evoChain.evolves_to[0];
    }
  
    const evoHTMLParts = await Promise.all(
      evoStages.map(async ({ name, level }, index) => {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const data = await res.json();
        const img = data.sprites.other['official-artwork'].front_default;
        const label = level ? `Lv. ${level}` : (index === evoStages.length - 1 ? "Final" : "Base");
        return `
          <div class="evo_stage">
            <img src="${img}">
            <p>${label}</p>
          </div>
        `;
      })
    );
  
    return evoHTMLParts.join('');
  }
  