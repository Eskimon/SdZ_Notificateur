function restaurerOptions() //resélectionner les options déja choisies
{
	document.getElementById('interval').value = grenier.getRefreshInterval();
	document.getElementById("newTab").checked = grenier.getComportement();
}

function sauverOptions() { //enregistrer les options, fonction appelée par le click sur le bouton
    grenier.setRefreshInterval(parseInt(document.getElementById('interval').value));
    grenier.setComportement(document.getElementById("newTab").checked);
    
    window.close();
}
    
document.addEventListener('DOMContentLoaded', function () {
	var button = document.getElementById("enregistrer");
	button.addEventListener("click", function() { sauverOptions();});
	
	restaurerOptions();
});

