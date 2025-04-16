const loadedPokemons = [];

document.getElementById('pokemon_container').addEventListener('click', e => {
    const card = e.target.closest('.pokemon_card');
    if (!card) return;
  
    const index = card.getAttribute('data-index');
    if (index !== null) {
      openOverlay(loadedPokemons[index]);
    }
  });
  