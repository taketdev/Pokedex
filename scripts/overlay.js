function getOverlayData(poke) {
  const name = poke.name;
  const id = poke.id;
  const img = poke.sprites.other["official-artwork"].front_default;
  const types = poke.types.map((t) => t.type.name);
  const height = poke.height / 10 + "m";
  const weight = poke.weight / 10 + "kg";
  const abilities = poke.abilities.map((a) => a.ability.name);
  const stats = poke.stats.map((s) => s.base_stat);
  const statNames = ["HP", "ATK", "DEF", "SpA", "SpD", "SPD"];
  const statHTML = stats
    .map(
      (val, i) =>
        `<div class="stat ${statNames[i].toLowerCase()}">` +
        `<span>${statNames[i]}</span><strong>${val}</strong></div>`
    )
    .join("");
  const total = stats.reduce((a, b) => a + b, 0);
  const typeHTML = types
    .map((type) => `<span class="type ${type}">${type}</span>`)
    .join("");
  const abilityHTML = abilities
    .map((a) => `<div class="ability">${a}</div>`)
    .join("");
  const firstType = types[0];
  const typeClass = `type ${firstType}`;

  return {
    name,
    id,
    img,
    typeClass,
    typeHTML,
    height,
    weight,
    abilityHTML,
    statHTML,
    total,
  };
}

function renderOverlayTemplate(data, index) {
  const {
    name,
    id,
    img,
    typeClass,
    typeHTML,
    height,
    weight,
    abilityHTML,
    statHTML,
    total,
  } = data;

  document.getElementById("pokemon_overlay").innerHTML = `
    <div id="overlay_click_area" class="overlay" onclick="closeOverlayOnOutsideClick(event)">  
        <div class="detail_card">
            <button class="close_btn" onclick="closeOverlay()">x</button>
        <div class="type_bg ${typeClass}"></div>
          <img src="${img}" class="detail_img">
          <p class="pokemon_number_overlay">N° ${id}</p>
          <h2 class="pokemon_name">${name}</h2>
        <div class="pokemon_types">${typeHTML}</div>
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
            <img src="./assets/img/loading/pokeball_animation.svg" alt="Lädt…" class="loader-svg">
        </div>
        <div class="nav_arrows">
            <button id="prevBtn" class="arrow left" onclick="prevPokemon(${index})">←</button>
            <button id="nextBtn" class="arrow right" onclick="nextPokemon(${index})">→</button>
        </div>
        </div>
    </div>`;
}

function showOverlay(index) {
  let data;
  const isSearch = searchInput.value.trim().length >= 3;

  if (isSearch) {
    data = searchResults[index];
  } else {
    data = loadedPokemons[index];
  }

  const pokeData = getOverlayData(data);
  renderOverlayTemplate(pokeData, index);

  const overlay = document.getElementById("pokemon_overlay");
  overlay.classList.remove("d_none");
  document.body.style.overflow = "hidden";

  getEvolutionHTML(data.name).then((evolutionHTML) => {
    document.querySelector(".evolution").innerHTML = evolutionHTML;
  });

  updateArrowButtons(index, isSearch);
}

async function fetchEvolutionChain(pokemonName) {
  const speciesRes = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`
  );
  const {
    evolution_chain: { url },
  } = await speciesRes.json();
  const chainRes = await fetch(url);
  return (await chainRes.json()).chain;
}

function extractStages(chain) {
  const stages = [];
  let node = chain;
  while (node) {
    const name = node.species.name;
    const level = node.evolution_details?.[0]?.min_level || null;
    stages.push({ name, level });
    node = node.evolves_to[0];
  }
  return stages;
}

async function buildEvolutionHTML(stages) {
  const parts = await Promise.all(
    stages.map(async ({ name, level }, i, arr) => {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const data = await res.json();
      const img = data.sprites.other["official-artwork"].front_default;
      const label = level
        ? `Lv. ${level}`
        : i === arr.length - 1
        ? "Final"
        : "Base";
      return `<div class=\"evo_stage\"><img src=\"${img}\"><p>${label}</p></div>`;
    })
  );
  return parts.join("");
}

async function getEvolutionHTML(pokemonName) {
  try {
    const chain = await fetchEvolutionChain(pokemonName);
    const stages = extractStages(chain);

    if (stages.length <= 1) {
      return `<p class="no-evolution-msg">Unfortunately, no evolution was found.</p>`;
    }

    return await buildEvolutionHTML(stages);
  } catch (error) {
    console.error("Error loading Evolution:", error);
    return `<p class="no-evolution-msg">Unfortunately, no evolution was found.</p>`;
  }
}

function closeOverlay() {
  const overlay = document.getElementById("pokemon_overlay");
  document.body.style.overflow = "auto";
  overlay.classList.add("d_none");
  overlay.innerHTML = "";
}

function closeOverlayOnOutsideClick(event) {
  if (event.target.id === "overlay_click_area") closeOverlay();
}

function updateArrowButtons(index, isSearch = false) {
  const pokemonsArray = isSearch ? searchResults : loadedPokemons;
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  prevBtn.disabled = index <= 0;
  nextBtn.disabled = index >= pokemonsArray.length - 1;
}

function prevPokemon(index) {
  if (index > 0) {
    const isSearch = searchInput.value.trim().length >= 3;
    showOverlay(
      isSearch ? searchResults.indexOf(searchResults[index - 1]) : index - 1
    );
    updateArrowButtons(index - 1, isSearch);
  }
}

function nextPokemon(index) {
  const isSearch = searchInput.value.trim().length >= 3;
  const pokemonsArray = isSearch ? searchResults : loadedPokemons;

  if (index < pokemonsArray.length - 1) {
    showOverlay(index + 1);
    updateArrowButtons(index + 1, isSearch);
  }
}
