chrome.alarms.create('refresh', {periodInMinutes: grenier.getRefreshInterval()}); //alarm pour aller vérifier les news

verifierNotif(); //lance de suite une vérification des notifs

//----- les déclarations ----

chrome.alarms.onAlarm.addListener(function (alarm) { // le listener de l'alarme de check
    if (alarm.name == 'refresh') {
        verifierNotif();
    }
});

var checker = "http://www.siteduzero.com/";
chrome.tabs.onUpdated.addListener(function(tabId, props) {
	if((typeof props.url !== 'undefined') && (props.url.substring(0, checker.length) == checker))
		verifierNotif();
});

function verifierNotif() { //récupère la page et parse
	var xhr = new XMLHttpRequest(); 
	// On défini ce qu'on va faire quand on aura la réponse
	xhr.onreadystatechange = function(){
		// On ne fait quelque chose que si on a tout reçu et que le serveur est ok
		if(xhr.readyState == 4 && xhr.status == 200){
			parsing(xhr.responseText);
		}
	}
	xhr.open("GET","http://www.siteduzero.com/",true);
	xhr.send(null);
}

function parsing(data) {
	//commence par nettoyer en virant toutes les balises qui ont un src
	data = cleaning(data);
	
	var list_notif = $(data).find("div#lastNotifications");
	//console.log(list_notif);
	
	var notifications = $(list_notif).find("ul.list li.notification");
	//console.log(notifications);
	//console.log(notifications.length-1); //-1 pour virer le seeall
	
	if(notifications.length > 1)
		chrome.browserAction.setBadgeText({text:(notifications.length-1).toString()});
	else
		chrome.browserAction.setBadgeText({text:""});
}

function cleaning(data) {
	data = data.replace(/<img[^>]*>/gi,""); //vire les images
	//data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,''); //vire le javascript
	return data;
}


//action lorsqu'on click sur le bouton
if(grenier.getComportement()) { //soit on ouvre le SdZ
	chrome.browserAction.setPopup({popup:""})
	chrome.browserAction.onClicked.addListener(function(activeTab) {
		chrome.tabs.create({'url': "http://www.siteduzero.com/"});
	});
} else { //sinon on ouvre une popup avec le contenu des notifs
	chrome.browserAction.setPopup({popup:"popup.html"})
}

