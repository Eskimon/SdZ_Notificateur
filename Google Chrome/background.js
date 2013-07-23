chrome.alarms.create('refresh', {periodInMinutes: grenier.getRefreshInterval()}); //alarm pour aller vérifier les news

verifierNotif(); //lance de suite une vérification des notifs

//----- les déclarations ----

chrome.alarms.onAlarm.addListener(function (alarm) { // le listener de l'alarme de check
    if (alarm.name == 'refresh') {
        verifierNotif();
    }
});

var reference = { //quelques chaines utiles pour le parsing
	nbNotifStringStart : "<span class=\"nbNotif\">",
	nbNotifStringStop : "</span>"
};

function verifierNotif() { //récupère la page et parse
	var xhr = new XMLHttpRequest(); 
	// On défini ce qu'on va faire quand on aura la réponse
	xhr.onreadystatechange = function(){
		// On ne fait quelque chose que si on a tout reçu et que le serveur est ok
		if(xhr.readyState == 4 && xhr.status == 200){
			parserDonnees(xhr.responseText);
		}
	}
	xhr.open("GET","http://www.siteduzero.com/",true);
	xhr.send(null);
}

function parserDonnees(data) { //parseur (à revoir)
	var idxNotifDebut = data.indexOf(reference.nbNotifStringStart);
	var idxNotifFin = data.indexOf(reference.nbNotifStringStop, idxNotifDebut+reference.nbNotifStringStart.length);

	nbNotif = parseInt(data.substring(idxNotifDebut+reference.nbNotifStringStart.length, idxNotifFin));
	
	if(isNaN(nbNotif))
		chrome.browserAction.setBadgeText({text:"0"});
	else
		chrome.browserAction.setBadgeText({text:(nbNotif).toString()});
}


//action lorsqu'on click sur le bouton
console.log(grenier.getComportement());
if(grenier.getComportement()) { //soit on ouvre le SdZ
	chrome.browserAction.setPopup({popup:""})
	chrome.browserAction.onClicked.addListener(function(activeTab) {
		chrome.tabs.create({'url': "http://www.siteduzero.com/"});
	});
} else { //sinon on ouvre une popup avec le contenu des notifs
	chrome.browserAction.setPopup({popup:"popup.html"})
}

