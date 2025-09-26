function getOverlayData(poke) {
  const name = poke.name;
  const id = poke.id;
  const img = poke.sprites.other["official-artwork"].front_default;
  const types = poke.types.map((t) => t.type.name);
  const height = getHeight(poke.height);
  const weight = getWeight(poke.weight);
  const abilities = poke.abilities.map((a) => a.ability.name);
  const abilityHTML = generateAbilityHTML(abilities);
  const { stats, statHTML, total } = processStats(poke.stats);
  const { typeHTML, typeClass } = processTypes(types);

  return {
    name, id, img, typeClass, typeHTML, height, weight, abilities, statHTML, total, types, abilityHTML
  };
}

function getHeight(heightInDecimeters) {
  return (heightInDecimeters / 10) + "m";
}

function getWeight(weightInHectograms) {
  return (weightInHectograms / 10) + "kg";
}

function generateAbilityHTML(abilitiesArray) {
  return abilitiesArray.map(ability => 
    `<div class="ability">${ability}</div>`
  ).join("");
}

function processStats(statsArray) {
  const statNames = ["HP", "ATK", "DEF", "SpA", "SpD", "SPD"];
  const stats = statsArray.map(s => s.base_stat);
  const total = stats.reduce((a, b) => a + b, 0);
  
  const statHTML = stats.map((val, i) => 
    `<div class="stat ${statNames[i].toLowerCase()}">
      <span>${statNames[i]}</span>
      <strong>${val}</strong>
    </div>`
  ).join("");
  
  return { stats, statHTML, total };
}

function processTypes(typesArray) {
  const typeHTML = typesArray.map(type => 
    `<span class="type ${type}">${type}</span>`
  ).join("");
  
  const typeClass = `type ${typesArray[0]}`;
  
  return { typeHTML, typeClass };
}

function renderOverlayTemplate(data, index) {
  const {name, id, img, typeClass, typeHTML, height, weight, abilityHTML, statHTML, total} = data;

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
  const data = getPokemonData(index);
  const pokeData = getOverlayData(data);
  renderOverlayTemplate(pokeData, index);

  showOverlayElement();
  loadEvolutionData(pokeData.name, pokeData.types[0]);
  updateNavigationButtons(index);
}

function getPokemonData(index) {
  const isSearchActive = searchInput.value.trim().length >= 3;
  return isSearchActive ? searchResults[index] : loadedPokemons[index];
}

function showOverlayElement() {
  const overlay = document.getElementById("pokemon_overlay");
  overlay.classList.remove("d_none");
  document.body.style.overflow = "hidden";
}

async function loadEvolutionData(pokemonName, firstType) {
  try {
    const evolutionHTML = await getEvolutionHTML(pokemonName);
    document.querySelector(".evolution").innerHTML = evolutionHTML;
  } catch (error) {
    console.error("Error loading Evolution:", error);
    document.querySelector(".evolution").innerHTML = `
      <p class="no-evolution-msg">Unfortunately, no evolution was found.</p>
    `;
  }
}

function updateNavigationButtons(index) {
  const isSearchActive = searchInput.value.trim().length >= 3;
  updateArrowButtons(index, isSearchActive);
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

      return `
        <div class="evo_stage clickable" onclick="navigateToEvolution('${name}')" title="Click to view ${name}">
          <img src="${img}" alt="${name}">
          <p class="evo-label">${label}</p>
          <p class="evo-name">${name}</p>
        </div>
      `;
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

async function navigateToEvolution(pokemonName) {
  try {
    // Show loading state
    const overlay = document.getElementById("pokemon_overlay");
    overlay.style.opacity = "0.6";

    // Fetch the Pokemon data
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    const pokemonData = await response.json();

    // Get overlay data and render
    const pokeData = getOverlayData(pokemonData);
    renderOverlayTemplate(pokeData, -1); // Use -1 to indicate evolution navigation

    // Reset opacity
    overlay.style.opacity = "1";

    // Load evolution data for the new Pokemon
    loadEvolutionData(pokeData.name, pokeData.types[0]);

    // Update navigation buttons - disable them since we're not in normal list mode
    disableNavigationButtons();

  } catch (error) {
    console.error("Error navigating to evolution:", error);
    // Reset overlay state on error
    const overlay = document.getElementById("pokemon_overlay");
    overlay.style.opacity = "1";

    // Show error message
    alert("Sorry, could not load evolution data. Please try again.");
  }
}

function disableNavigationButtons() {
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (prevBtn) {
    prevBtn.disabled = true;
    prevBtn.style.opacity = "0.5";
  }
  if (nextBtn) {
    nextBtn.disabled = true;
    nextBtn.style.opacity = "0.5";
  }
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