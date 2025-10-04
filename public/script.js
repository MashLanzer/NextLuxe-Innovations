document.addEventListener('DOMContentLoaded', function() {
    const searchButtons = document.querySelectorAll('.search-button');

    searchButtons.forEach(button => {
        button.addEventListener('click', function() {
            alert(`Has seleccionado la opción: ${this.textContent}`);
        });
    });
});
