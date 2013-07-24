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

//action lorsqu'on click sur le bouton
if(grenier.getComportement()) { //soit on ouvre le SdZ
	chrome.browserAction.setPopup({popup:""})
	chrome.browserAction.onClicked.addListener(function(activeTab) {
		chrome.tabs.create({'url': "http://www.siteduzero.com/"});
	});
} else { //sinon on ouvre une popup avec le contenu des notifs
	chrome.browserAction.setPopup({popup:"popup.html"})
}

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
	
	//DEBUG !!!
	data = grenier.fakeData;
	//DEBUG !!!
	
	//var list_notif = $(data).find("div#scrollMe");
	//console.log(list_notif);
	
	var notifications = $(data).find("div#scrollMe ul.list li.notification");
	console.log(notifications);
	
	if(notifications.length > 1)
		chrome.browserAction.setBadgeText({text:(notifications.length).toString()});
	else
		chrome.browserAction.setBadgeText({text:""});
		
	//action lorsqu'on click sur le bouton
	if(grenier.getComportement() || (notifications.length < 1)) { //soit on ouvre le SdZ
		grenier.saveLastNotifs("Aucune notification");
	} else { //sinon on ouvre une popup avec le contenu des notifs
		sauverNotifs(notifications);
	}
}

function cleaning(data) {
	data = data.replace(/<img[^>]*>/gi,""); //vire les images
	//data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,''); //vire le javascript
	return data;
}

function sauverNotifs(data) {
	var tab = [];
	var len = data.length;
	for (var i = 0; i < len; i++) {
    	var obj = {
        	titre: $(data[i]).find("li.title").text(),
        	temps: $(data[i]).find("li.date").text(),
        	lien: $(data[i]).find("a.link").attr('href')
    	};
    	tab.push(obj);    	
	}
	grenier.saveLastNotifs(tab);
}

