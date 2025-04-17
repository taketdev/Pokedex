function closeOverlay(){
    const overlay = document.getElementById('pokemon_overlay');
    overlay.classList.add('d_none');
    overlay.innerHTML = '';
}

function prevPokemon(index) {
    if (index > 0) {
      showOverlay(index - 1);
    }
}
  
function nextPokemon(index) {
    if (index < loadedPokemons.length - 1) {
      showOverlay(index + 1);
    }
}
  