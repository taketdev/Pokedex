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
    return loadMoreFilteredResults();
  }

  // Check if we reached the limit (1000+ Pokemon available)
  if (loadedPokemons.length >= 1000) {
    updateLoadMoreButtonToComplete();
    return;
  }

  // Original load more functionality for non-filter mode
  toggleLoading(true);
  try {
    const [newPokemons] = await Promise.all([fetchBatch(), delay(500)]);
    renderBatch(newPokemons);

    // Update button state based on how many Pokemon we have
    if (loadedPokemons.length >= 1000) {
      updateLoadMoreButtonToComplete();
    }
  } catch (err) {
    console.error("Error loading more Pokemon:", err);
    showLoadMoreError();
  } finally {
    toggleLoading(false);
  }
}

function updateLoadMoreButtonToComplete() {
  const btn = document.getElementById("load_more_button");
  if (btn) {
    btn.textContent = "All Pokémon Loaded";
    btn.disabled = true;
    btn.onclick = null;
  }
}

function showLoadMoreError() {
  const btn = document.getElementById("load_more_button");
  if (btn) {
    btn.textContent = "Error - Try Again";
    btn.disabled = false;
    btn.onclick = loadMore;
  }
}
