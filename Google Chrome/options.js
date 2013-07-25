function restaurerOptions() //resélectionner les options déja choisies
{
	document.getElementById('interval').value = grenier.getRefreshInterval();
	document.getElementById("newTab").checked = grenier.getComportement();
	document.getElementById("allNotifs").checked = grenier.isAllNotifsSet();
	document.getElementById("notifNative").checked = grenier.isNotifNativeSet();
}

function sauverOptions() { //enregistrer les options, fonction appelée par le click sur le bouton
    grenier.setRefreshInterval(parseInt(document.getElementById('interval').value));
    grenier.setComportement(document.getElementById("newTab").checked);
    grenier.setAllNotifs(document.getElementById("allNotifs").checked);
    grenier.setNotifNative(document.getElementById("notifNative").checked);
    
    //mise à jour du timer du background
    chrome.runtime.sendMessage({temps: document.getElementById('interval').value});
    
    window.close();
}
    
document.addEventListener('DOMContentLoaded', function () {
	if(typeof chrome.notifications === 'undefined') { //test pour savoir si les notifs chrome sont dispos sur la platform
		//on cache le span d'options
		var mySpan = document.getElementById('notifSpan');
		mySpan.style.display = "none";
	}
	var button = document.getElementById("enregistrer");
	button.addEventListener("click", function() { sauverOptions();});
	
	restaurerOptions();
});

