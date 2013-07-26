function restaurerOptions() //resélectionner les options déja choisies
{
    chrome.storage.sync.get(["updateInterval", "openInNewTab", "showAllNotifButton", "showDesktopNotif"], function(items) {
        document.getElementById('interval').value = items["updateInterval"] || 5;
        document.getElementById("newTab").checked = items["openInNewTab"] === undefined ? true : items["openInNewTab"];
        document.getElementById("allNotifs").checked = items["showAllNotifButton"] === undefined ? true : items["showAllNotifButton"];
        document.getElementById("notifNative").checked = items["showDesktopNotif"] === undefined ? true : items["showDesktopNotif"];
    });
}

function sauverOptions() { //enregistrer les options, fonction appelée par le click sur le bouton
    var newOptions = {
        updateInterval: parseInt(document.getElementById('interval').value),
        openInNewTab: document.getElementById("newTab").checked,
        showAllNotifButton: document.getElementById("allNotifs").checked,
        showDesktopNotif: document.getElementById("notifNative").checked
    }
   
    chrome.storage.sync.set(newOptions, function() {
        window.close();
    });
}
    
document.addEventListener('DOMContentLoaded', function () {
	if(typeof chrome.notifications === 'undefined') { //test pour savoir si les notifs chrome sont dispos sur la platform
		//on cache le span d'options
		var mySpan = document.getElementById('notifSpan');
		mySpan.style.display = "none";
	}

	restaurerOptions();
	
	var button = document.getElementById("enregistrer");
	button.addEventListener("click", function() { sauverOptions();});
	
	var newTab = document.getElementById("newTab");
	newTab.addEventListener("click", function() { 
		toggleState(newTab.checked);
	});
});

function toggleState(etat) {
	var liste = document.getElementById("allNotifs");
	var listeLabel = document.getElementById("allNotifsLabel");
	
	if(etat == true) {
		liste.disabled = true;
		listeLabel.disabled = true;
	}
	else {
		liste.disabled = false;
		listeLabel.disabled = false;
	}
}
