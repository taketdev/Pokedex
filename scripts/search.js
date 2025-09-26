let allPokemonList = [];
let currentFilteredResults = [];
let currentPage = 0;
let isFilterMode = false;
let hasMoreResults = true;

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const container = document.getElementById("pokemon_container");

async function loadAllPokemonNames() {
  allPokemonList = await fetchPokemons(1000, 0);
}

function renderList(pokemons) {
  container.innerHTML = "";
  pokemons.forEach((poke) => {
    container.innerHTML += renderCardTemplate(
      poke,
      loadedPokemons.indexOf(poke)
    );
  });
}

function getMatches(query) {
  const filters = getActiveFilters();
  const hasFilters = hasActiveFilters();
  
  // If no query and no filters, return empty to show default
  if (!query && !hasFilters) {
    return [];
  }
  
  let filteredList = allPokemonList;
  
  // Apply name filter if query exists
  if (query && query.length >= 3) {
    filteredList = filteredList.filter((p) => p.name.includes(query));
  }
  
  // Apply generation filter (pre-filter by ID range)
  if (filters.generation) {
    filteredList = filteredList.filter((p) => {
      const id = getPokemonIdFromUrl(p.url);
      return isInGeneration(id, filters.generation);
    });
  }
  
  // Apply region filter (same as generation)
  if (filters.region) {
    filteredList = filteredList.filter((p) => {
      const id = getPokemonIdFromUrl(p.url);
      return isInRegion(id, filters.region);
    });
  }
  
  // For type, ability, stats, and evolution filters, we need to load more Pokemon
  // to ensure we have enough after detailed filtering
  let limit = 200; // Load more for detailed filtering
  
  if (query && query.length >= 3) {
    limit = Math.min(100, filteredList.length); // Smaller limit for name searches
  }
  
  return filteredList
    .slice(0, limit)
    .map((p) => p.url);
}

function getPokemonIdFromUrl(url) {
  const parts = url.split('/');
  return parseInt(parts[parts.length - 2]);
}

function isInGeneration(id, generation) {
  const genRanges = {
    '1': [1, 151],
    '2': [152, 251], 
    '3': [252, 386],
    '4': [387, 493],
    '5': [494, 649],
    '6': [650, 721],
    '7': [722, 809],
    '8': [810, 905]
  };
  
  const [min, max] = genRanges[generation] || [0, 9999];
  return id >= min && id <= max;
}

function isInRegion(id, region) {
  // Region mapping (same as generation for main series)
  const regionRanges = {
    'kanto': [1, 151],
    'johto': [152, 251], 
    'hoenn': [252, 386],
    'sinnoh': [387, 493],
    'unova': [494, 649],
    'kalos': [650, 721],
    'alola': [722, 809],
    'galar': [810, 905]
  };
  
  const [min, max] = regionRanges[region] || [0, 9999];
  return id >= min && id <= max;
}

function getStatValue(pokemon, statType) {
  if (statType === 'total') {
    return pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
  }
  
  const statMap = {
    'hp': 0,
    'attack': 1,
    'defense': 2,
    'special-attack': 3,
    'special-defense': 4,
    'speed': 5
  };
  
  const statIndex = statMap[statType];
  return statIndex !== undefined ? pokemon.stats[statIndex].base_stat : 0;
}

async function getEvolutionStage(pokemonName) {
  try {
    const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`);
    const speciesData = await speciesRes.json();
    
    const chainRes = await fetch(speciesData.evolution_chain.url);
    const chainData = await chainRes.json();
    
    return analyzeEvolutionPosition(chainData.chain, pokemonName);
  } catch (error) {
    throw error;
  }
}

function analyzeEvolutionPosition(chain, targetName) {
  // Find the position of the pokemon in the evolution chain
  let currentStage = 0;
  let hasEvolution = false;
  let canEvolve = false;
  
  function traverse(node, stage) {
    if (node.species.name === targetName) {
      currentStage = stage;
      canEvolve = node.evolves_to.length > 0;
      return true;
    }
    
    for (const evolution of node.evolves_to) {
      if (traverse(evolution, stage + 1)) {
        hasEvolution = true;
        return true;
      }
    }
    return false;
  }
  
  traverse(chain, 0);
  
  return {
    stage: currentStage,
    canEvolve: canEvolve,
    hasEvolution: hasEvolution || currentStage > 0
  };
}

function checkEvolutionCriteria(pokemon, filter) {
  // Simplified evolution check based on Pokemon name patterns and known data
  const name = pokemon.name.toLowerCase();
  const id = pokemon.id;
  
  // Known base forms that can evolve (simplified list)
  const baseFormNames = [
    'bulbasaur', 'charmander', 'squirtle', 'caterpie', 'weedle', 'pidgey',
    'rattata', 'spearow', 'ekans', 'pichu', 'cleffa', 'igglybuff', 'togepi',
    'natu', 'mareep', 'hoppip', 'aipom', 'sunkern', 'yanma', 'wooper',
    'murkrow', 'misdreavus', 'gligar', 'snubbull', 'qwilfish', 'shuckle'
  ];
  
  // Known final evolutions (simplified list)
  const finalEvolutions = [
    'venusaur', 'charizard', 'blastoise', 'butterfree', 'beedrill', 'pidgeot',
    'raticate', 'fearow', 'arbok', 'raichu', 'nidoqueen', 'nidoking',
    'clefable', 'ninetales', 'jigglypuff', 'vileplume', 'parasect', 'venomoth'
  ];
  
  // Known Pokemon that don't evolve
  const noEvolution = [
    'ditto', 'aerodactyl', 'snorlax', 'articuno', 'zapdos', 'moltres',
    'mewtwo', 'mew', 'unown', 'dunsparce', 'qwilfish', 'heracross',
    'corsola', 'delibird', 'skarmory', 'stantler', 'smeargle', 'miltank'
  ];
  
  switch (filter) {
    case 'no-evolution':
      return noEvolution.includes(name) || (id >= 144 && id <= 151); // Legendaries
    case 'base-form':
      return baseFormNames.includes(name) || name.endsWith('baby') || id <= 150;
    case 'evolved-form':
      return !baseFormNames.includes(name) && !noEvolution.includes(name) && id <= 500;
    case 'final-evolution':
      return finalEvolutions.includes(name) || name.includes('mega');
    default:
      return true;
  }
}

function matchesEvolutionFilter(evolutionData, filter) {
  switch (filter) {
    case 'no-evolution':
      return !evolutionData.hasEvolution;
    case 'base-form':
      return evolutionData.stage === 0 && evolutionData.canEvolve;
    case 'evolved-form':
      return evolutionData.stage > 0;
    case 'final-evolution':
      return evolutionData.stage > 0 && !evolutionData.canEvolve;
    default:
      return true;
  }
}

async function fetchDetails(urls) {
  return Promise.all(urls.map((u) => fetch(u).then((r) => r.json())));
}

function setLoadMoreVisible(visible) {
  const loadMoreButton = document.getElementById("load_more_button");
  if (loadMoreButton) {
    loadMoreButton.style.display = visible ? "block" : "none";
  }
}

async function handleSearch() {
  const q = getQuery();
  const hasFilters = hasActiveFilters();
  
  // Update mode
  isFilterMode = hasFilters || q.length >= 3;
  
  toggleLoadMore(isFilterMode);
  
  // If no search query and no filters, show default
  if (q.length < 3 && !hasFilters) {
    isFilterMode = false;
    return showDefaultOrShort(q);
  }
  
  toggleLoading(true);
  
  try {
    // Reset pagination for new search
    currentPage = 0;
    currentFilteredResults = [];
    hasMoreResults = true;
    
    // Load first batch of filtered results
    await loadFilteredResults(q, true);
  } catch (error) {
    console.error("Search failed:", error);
    showNoResults();
  }
}

async function loadFilteredResults(query = "", isNewSearch = false) {
  if (!hasMoreResults && !isNewSearch) {
    showNoMoreResults();
    return;
  }
  
  toggleLoading(true);
  
  try {
    let allMatches;
    if (query.length >= 3 || hasActiveFilters()) {
      allMatches = getMatches(query);
      if (!allMatches.length) {
        hasMoreResults = false;
        container.innerHTML = '<p style="text-align:center;margin-top:20px;">No Pokémon found.</p>';
        toggleLoading(false);
        return;
      }
    } else {
      hasMoreResults = false;
      return showDefaultOrShort(query);
    }

    // If this is a new search, reset and load everything
    if (isNewSearch) {
      currentFilteredResults = [];
      container.innerHTML = '';
      
      // Load and filter all matches
      console.log(`Loading ${allMatches.length} Pokemon for filtering...`);
      const allData = await fetchDetails(allMatches);
      const allFilteredData = await applyDetailedFilters(allData);
      
      // Store filtered results for pagination
      currentFilteredResults = allFilteredData;
      currentPage = 0;
      
      // Show first batch
      const batchSize = 20;
      const firstBatch = allFilteredData.slice(0, batchSize);
      
      // Set search results for overlay navigation
      searchResults = firstBatch;
      
      // Render first batch
      container.innerHTML = firstBatch
        .map((p, i) => renderCardTemplate(p, i))
        .join('');
      
      // Update pagination state
      hasMoreResults = allFilteredData.length > batchSize;
      currentPage = 1;
      
      console.log(`Loaded ${allFilteredData.length} filtered Pokemon, showing first ${firstBatch.length}, more: ${hasMoreResults}`);
      
    } else {
      // Load more from already filtered results
      const batchSize = 20;
      const startIndex = currentPage * batchSize;
      const endIndex = Math.min(startIndex + batchSize, currentFilteredResults.length);
      const nextBatch = currentFilteredResults.slice(startIndex, endIndex);
      
      if (nextBatch.length === 0) {
        hasMoreResults = false;
        showNoMoreResults();
        return;
      }
      
      // Update search results for overlay navigation
      searchResults = [...searchResults, ...nextBatch];
      
      // Append to existing results
      const currentHTML = container.innerHTML;
      const newHTML = nextBatch.map((p, i) => 
        renderCardTemplate(p, startIndex + i)
      ).join('');
      container.innerHTML = currentHTML + newHTML;
      
      currentPage++;
      hasMoreResults = endIndex < currentFilteredResults.length;
      
      console.log(`Loaded more: showing ${searchResults.length} total, more available: ${hasMoreResults}`);
    }
    
    // Update load more button
    updateLoadMoreButton();
    toggleLoading(false);
    
  } catch (error) {
    console.error("Error loading filtered results:", error);
    showNoResults();
  }
}

function getQuery() {
  let input = document.getElementById("search_input") 
    || document.getElementById("searchInput")
    || (typeof window.searchInput !== 'undefined' && window.searchInput);
  if (input && typeof input.value === 'string') {
    return input.value.trim().toLowerCase();
  }
  return "";
}

function toggleLoadMore(hasSearchOrFilter) {
  const btn = document.getElementById("load_more_button");
  if (!btn) return;
  // Don't hide the button - let updateLoadMoreButton handle visibility
  btn.style.visibility = "visible";
}

function showDefaultOrShort(q) {
  const filters = getActiveFilters();
  const hasActiveFilters = filters.type || filters.generation || filters.minStats > 200;
  
  if (!q.length && !hasActiveFilters) {
    container.innerHTML = loadedPokemons
      .map((p, i) => renderCardTemplate(p, i))
      .join('');
  } else if (!q.length && hasActiveFilters) {
    // Apply filters to loaded pokemon for filter-only search
    const filteredPokemon = loadedPokemons.filter(pokemon => {
      // Type filter
      if (filters.type) {
        const hasType = pokemon.types.some(type => type.type.name === filters.type);
        if (!hasType) return false;
      }
      
      // Generation filter  
      if (filters.generation) {
        if (!isInGeneration(pokemon.id, filters.generation)) return false;
      }
      
      // Stats filter
      if (filters.minStats > 200) {
        const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
        if (totalStats < filters.minStats) return false;
      }
      
      return true;
    });
    
    searchResults = filteredPokemon;
    container.innerHTML = filteredPokemon
      .map((p, i) => renderCardTemplate(p, i))
      .join('');
  }
  toggleLoading(false);
}

function showNoResults() {
  container.innerHTML = '<p style="text-align:center;margin-top:20px;">No Pokémon found.</p>';
  toggleLoading(false);
}

function showNoMoreResults() {
  toggleLoading(false);
  updateLoadMoreButton();
}

function updateLoadMoreButton() {
  const btn = document.getElementById("load_more_button");
  if (!btn) {
    console.log("Load more button not found!");
    return;
  }
  
  console.log(`Updating button: filterMode=${isFilterMode}, hasMore=${hasMoreResults}`);
  
  // Ensure button is properly centered
  btn.style.display = "block";
  btn.style.visibility = "visible";
  btn.style.margin = "0 auto";
  btn.style.textAlign = "center";
  
  if (isFilterMode) {
    if (hasMoreResults) {
      btn.textContent = "Load More Filtered Results";
      btn.disabled = false;
      btn.onclick = () => loadFilteredResults(getQuery(), false);
      console.log("Button set to: Load More Filtered Results");
    } else {
      btn.textContent = "No More Results";
      btn.disabled = true;
      btn.onclick = null;
      console.log("Button set to: No More Results");
    }
  } else {
    btn.textContent = "Load more Pokémon";
    btn.disabled = false;
    btn.onclick = loadMore;
    console.log("Button set to: Load more Pokémon");
  }
}

async function applyDetailedFilters(pokemonList) {
  const filters = getActiveFilters();
  const filteredPokemon = [];
  
  for (const pokemon of pokemonList) {
    // Basic type filter
    if (filters.type) {
      const hasType = pokemon.types.some(type => type.type.name === filters.type);
      if (!hasType) continue;
    }
    
    // Ability filter
    if (filters.ability) {
      const hasAbility = pokemon.abilities.some(ability => 
        ability.ability.name === filters.ability
      );
      if (!hasAbility) continue;
    }
    
    // Generation/Region filter (based on ID)
    if (filters.generation) {
      if (!isInGeneration(pokemon.id, filters.generation)) continue;
    }
    
    if (filters.region) {
      if (!isInRegion(pokemon.id, filters.region)) continue;
    }
    
    // Base stat filter
    if (filters.statType && filters.minBaseStat > 10) {
      const statValue = getStatValue(pokemon, filters.statType);
      if (statValue < filters.minBaseStat) continue;
    }
    
    // Total stats filter
    if (filters.minStats > 200) {
      const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
      if (totalStats < filters.minStats) continue;
    }
    
    // Evolution filter (simplified - no external API calls for performance)
    if (filters.evolution) {
      const meetsEvolutionCriteria = checkEvolutionCriteria(pokemon, filters.evolution);
      if (!meetsEvolutionCriteria) continue;
    }
    
    filteredPokemon.push(pokemon);
  }
  
  return filteredPokemon;
}

function renderList(list) {
  searchResults = list;
  container.innerHTML = list
    .map((p, i) => renderCardTemplate(p, i))
    .join('');
  toggleLoading(false);
}

async function renderFilteredList(list) {
  toggleLoading(true);
  const filteredList = await applyDetailedFilters(list);
  renderList(filteredList);
}

async function setup() {
  await loadAllPokemonNames();
  setLoadMoreVisible(true);
  // Initialize filter chips on page load
  updateFilterChips();
}

function clearSearchInput() {
  const searchInput = document.getElementById("searchInput");
  searchInput.value = "";
  handleSearch();
}

document.getElementById("searchInput").addEventListener("input", function () {
  const clearButton = document.getElementById("clearSearch");
  clearButton.style.display = this.value.length > 0 ? "block" : "none";
});

// Filter functionality
function toggleFilters() {
  const filterPanel = document.getElementById("filterPanel");
  const filterButton = document.getElementById("filterToggle");
  
  filterPanel.classList.toggle("expanded");
  filterButton.classList.toggle("active");
}

function updateStatsValue() {
  const slider = document.getElementById("statsRange");
  const valueDisplay = document.getElementById("statsValue");
  valueDisplay.textContent = slider.value + "+";
}

function updateBaseStatsValue() {
  const slider = document.getElementById("baseStatsRange");
  const valueDisplay = document.getElementById("baseStatsValue");
  valueDisplay.textContent = slider.value + "+";
}

// Initialize stats sliders
document.getElementById("statsRange").addEventListener("input", updateStatsValue);
document.getElementById("baseStatsRange").addEventListener("input", updateBaseStatsValue);

// Filter change handlers
document.getElementById("typeFilter").addEventListener("change", handleFilterChange);
document.getElementById("generationFilter").addEventListener("change", handleFilterChange);
document.getElementById("regionFilter").addEventListener("change", handleFilterChange);
document.getElementById("abilityFilter").addEventListener("change", handleFilterChange);
document.getElementById("statType").addEventListener("change", handleFilterChange);
document.getElementById("baseStatsRange").addEventListener("input", handleFilterChange);
document.getElementById("evolutionFilter").addEventListener("change", handleFilterChange);
document.getElementById("statsRange").addEventListener("input", handleFilterChange);

function handleFilterChange() {
  // Reset pagination when filters change
  currentPage = 0;
  currentFilteredResults = [];
  hasMoreResults = true;

  // Update filter chips
  updateFilterChips();

  // Apply filters to current search
  handleSearch();
}

function hasActiveFilters() {
  const filters = getActiveFilters();
  return !!(
    filters.type || 
    filters.generation || 
    filters.region || 
    filters.ability || 
    filters.evolution || 
    filters.minStats > 200 ||
    filters.minBaseStat > 10
  );
}

function getActiveFilters() {
  return {
    type: document.getElementById("typeFilter").value,
    generation: document.getElementById("generationFilter").value,
    region: document.getElementById("regionFilter").value,
    ability: document.getElementById("abilityFilter").value,
    statType: document.getElementById("statType").value,
    minBaseStat: parseInt(document.getElementById("baseStatsRange").value),
    evolution: document.getElementById("evolutionFilter").value,
    minStats: parseInt(document.getElementById("statsRange").value)
  };
}

// Filter Chips Functionality
function updateFilterChips() {
  const container = document.getElementById('filterChipsContainer');
  const filters = getActiveFilters();
  const hasFilters = hasActiveFilters();


  // Clear existing chips
  container.innerHTML = '';

  if (!hasFilters) {
    container.classList.remove('show');
    return;
  }

  container.classList.add('show');

  // Create chips for each active filter
  const chips = [];

  if (filters.type) {
    chips.push(createFilterChip('Type', capitalizeFirst(filters.type), 'typeFilter'));
  }

  if (filters.generation) {
    const genText = `Gen ${getRomanNumeral(filters.generation)}`;
    chips.push(createFilterChip('Generation', genText, 'generationFilter'));
  }

  if (filters.region) {
    chips.push(createFilterChip('Region', capitalizeFirst(filters.region), 'regionFilter'));
  }

  if (filters.ability) {
    chips.push(createFilterChip('Ability', formatAbilityName(filters.ability), 'abilityFilter'));
  }

  if (filters.evolution) {
    chips.push(createFilterChip('Evolution', formatEvolutionName(filters.evolution), 'evolutionFilter'));
  }

  if (filters.minBaseStat > 10) {
    const statName = formatStatName(filters.statType);
    chips.push(createFilterChip('Base Stat', `${statName} ${filters.minBaseStat}+`, 'baseStatsRange'));
  }

  if (filters.minStats > 200) {
    chips.push(createFilterChip('Total Stats', `${filters.minStats}+`, 'statsRange'));
  }

  // Add all chips to container
  chips.forEach(chip => container.appendChild(chip));

  // Add clear all button if multiple filters
  if (chips.length > 1) {
    const clearAllBtn = createClearAllButton();
    container.appendChild(clearAllBtn);
  }
}

function createFilterChip(label, value, filterId) {
  const chip = document.createElement('div');
  chip.className = 'filterChip';

  chip.innerHTML = `
    <span class="chipLabel">${label}:</span>
    <span class="chipValue">${value}</span>
    <button class="chipRemove" onclick="removeFilter('${filterId}')" title="Remove filter">×</button>
  `;

  return chip;
}

function createClearAllButton() {
  const button = document.createElement('button');
  button.className = 'clearAllFilters';
  button.innerHTML = '🗑️ Clear All';
  button.onclick = clearAllFilters;
  button.title = 'Clear all active filters';

  return button;
}

function removeFilter(filterId) {
  const element = document.getElementById(filterId);
  if (!element) return;

  // Reset the filter to default value
  if (element.type === 'range') {
    if (filterId === 'baseStatsRange') {
      element.value = 10;
      updateBaseStatsValue();
    } else if (filterId === 'statsRange') {
      element.value = 200;
      updateStatsValue();
    }
  } else {
    element.value = '';
  }

  // Trigger change to update UI and results
  handleFilterChange();
}

function clearAllFilters() {
  // Reset all filter elements to default values
  document.getElementById('typeFilter').value = '';
  document.getElementById('generationFilter').value = '';
  document.getElementById('regionFilter').value = '';
  document.getElementById('abilityFilter').value = '';
  document.getElementById('evolutionFilter').value = '';
  document.getElementById('baseStatsRange').value = 10;
  document.getElementById('statsRange').value = 200;

  // Update slider displays
  updateBaseStatsValue();
  updateStatsValue();

  // Trigger change to update UI and results
  handleFilterChange();
}

// Utility functions for formatting
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getRomanNumeral(num) {
  const romanNumerals = {
    '1': 'I', '2': 'II', '3': 'III', '4': 'IV',
    '5': 'V', '6': 'VI', '7': 'VII', '8': 'VIII'
  };
  return romanNumerals[num] || num;
}

function formatAbilityName(ability) {
  return ability.split('-')
    .map(word => capitalizeFirst(word))
    .join(' ');
}

function formatEvolutionName(evolution) {
  const evolutionNames = {
    'no-evolution': 'No Evolution',
    'base-form': 'Base Form',
    'evolved-form': 'Evolved Form',
    'final-evolution': 'Final Evolution'
  };
  return evolutionNames[evolution] || evolution;
}

function formatStatName(statType) {
  const statNames = {
    'hp': 'HP',
    'attack': 'ATK',
    'defense': 'DEF',
    'special-attack': 'SP.ATK',
    'special-defense': 'SP.DEF',
    'speed': 'SPD',
    'total': 'Total'
  };
  return statNames[statType] || statType;
}

setup();
