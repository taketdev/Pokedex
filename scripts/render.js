async function fetchPokemons(limit, offset) {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
  );
  const data = await response.json();
  return data.results;
}

function renderCardTemplate(poke, index) {
  const { name, id, sprites, types } = poke;
  const img = sprites.other["official-artwork"].front_default;
  const [t1 = "", t2 = ""] = types.map((t) => t.type.name);

  return `
   <div class="pokemon_card ${t1}" onclick="showOverlay(${index})">
      <div class="type_bg type ${t1}"></div>
      <img src="${img}" alt="${name}" class="pokemon_img pokemon_img ${t1}">
      <p class="pokemon_number">N° ${id}</p>
      <h2 class="pokemon_name">${name}</h2>
      <div class="pokemon_types">
        <span class="type ${t1}">${t1}</span>
        ${t2 ? `<span class="type ${t2}">${t2}</span>` : ""}
      </div>
    </div>
  `;
}

async function loadAndRenderPokemons() {
  const container = document.getElementById("pokemon_container");
  const limit = 20;
  const offset = loadedPokemons.length;
  const results = await fetchPokemons(limit, offset);

  for (const { url } of results) {
    const poke = await fetch(url).then((res) => res.json());
    loadedPokemons.push(poke);
    container.innerHTML += renderCardTemplate(poke, loadedPokemons.length - 1);
  }
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function toggleLoading(on) {
  const loader = document.querySelector(".loader_container");
  const btn = document.querySelector(".btn_load_more");
  loader.style.display = on ? "flex" : "none";
  btn.disabled = on;
  btn.textContent = on ? "Loading…" : "Load more Pokémon";
}

async function fetchBatch(limit = 20) {
  const offset = loadedPokemons.length;
  const results = await fetchPokemons(limit, offset);
  return Promise.all(
    results.map(({ url }) => fetch(url).then((r) => r.json()))
  );
}

function renderBatch(pokemons) {
  const container = document.getElementById("pokemon_container");
  const startIndex = loadedPokemons.length;
  loadedPokemons.push(...pokemons);
  const html = pokemons
    .map((p, i) => renderCardTemplate(p, startIndex + i))
    .join("");
  container.insertAdjacentHTML("beforeend", html);
}

async function loadMore() {
  // Check if we're in filter mode, if so use the new system
  if (typeof isFilterMode !== 'undefined' && isFilterMode) {
    return loadFilteredResults(getQuery(), false);
  }
  
  // Original load more functionality for non-filter mode
  toggleLoading(true);
  try {
    const [newPokemons] = await Promise.all([fetchBatch(), delay(1000)]);
    renderBatch(newPokemons);
  } catch (err) {
    console.error("Fehler beim Nachladen:", err);
  } finally {
    toggleLoading(false);
  }
}
