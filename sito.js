function vaiAllaRegistrazione() {
    window.location.href = "registrazione.html";
}

function validaRegistrazione() {
    const eta = document.getElementById('eta').value;

    if (!eta || isNaN(eta) || eta < 18) {
        alert("Per favore, inserisci una età valida maggiore o uguale a 18.");
        return false;
    }

    localStorage.setItem('eta', eta);
    localStorage.setItem('loggedIn', 'true');
    window.location.href = "bj.html";
    return false;
}