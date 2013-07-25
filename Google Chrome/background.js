chrome.alarms.create('refresh', {periodInMinutes: grenier.getRefreshInterval()}); //alarm pour aller vérifier les news

verifierNotif(); //lance de suite une vérification des notifs

//----- les déclarations ----

chrome.alarms.onAlarm.addListener(function (alarm) { // le listener de l'alarme de check
    if (alarm.name == 'refresh') {
    	verifierNotif();
    }
});

var checker = "http://www.siteduzero.com/";

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if((typeof tab.url !== 'undefined') && (tab.url.substring(0, checker.length) == checker) && (changeInfo.status == "complete")) {
		//on vire la notif sur le SdZ
		chrome.tabs.executeScript(tabId, {
            code: '\
var url = document.URL; \
url = url.slice(0,url.indexOf("?")) + "/" + url.slice(url.lastIndexOf("-")+1); \
var els = document.getElementsByTagName("a"); \
var len = els.length; \
var target = ""; \
for (var i = 0; i < len; i++) { \
    var el = els[i]; \
    if (el.href === url) { \
        target = els[i+1]; \
        break; \
    } \
} \
target.click();\
'
        });
		
		verifierNotif(); //on relance la vérification des notifications
	}
});

chrome.tabs.onCreated.addListener(function(tab) {
//	console.log(tab);
	if((typeof tab.url !== 'undefined') && (tab.url.substring(0, checker.length) == checker)) {
		verifierNotif();
	}
});

//action lorsqu'on click sur le bouton
if(grenier.getComportement()) { //soit on ouvre le SdZ
	chrome.browserAction.setPopup({popup:""})
	chrome.browserAction.onClicked.addListener(function(activeTab) {
		chrome.tabs.create({
			'url': "http://www.siteduzero.com/",
			'active': false
		});
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
	
	//avant de parser pour un truc peut etre vide, on vérifie que l'user est connecté
	var loginBox = $(data).find("div#login");
	//on est pas connecté !
	if(loginBox.length != 0) {
		chrome.browserAction.setIcon({"path":"icons/icone_38_logout.png"});
		return;
	} else {
		chrome.browserAction.setIcon({"path":"icons/icone_38.png"});
	}
	
	var notifications = $(data).find("div#scrollMe ul.list li.notification");
	
	if(notifications.length < 1)
		chrome.browserAction.setBadgeText({text:""});
	else
		chrome.browserAction.setBadgeText({text:(notifications.length).toString()});
		
	//action lorsqu'on click sur le bouton
	if(grenier.getComportement() || (notifications.length < 1)) { //soit on ouvre le SdZ
		sauverNotifs("");
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
	var tab = [],
	    len = data.length,
	    oldNotifs = grenier.getLastNotifs();
	for (var i = 0; i < len; i++) {
    	var obj = {
        	titre: $(data[i]).find("li.title").text(),
        	temps: $(data[i]).find("li.date").text(),
        	lien: $(data[i]).find("a.link").attr('href'),
        	archive: $(data[i]).find("a.delete").attr('href')
    	};
    	tab.push(obj);
    	
        var notifOptions = { // Options de la notification
            type: "basic",
            title: obj.titre,
            message: obj.temps,
            iconUrl: "icons/icone_48.png",
            buttons: [{ title: "Voir"}/*,
                      { title: "Archiver (not working)"}*/]
        }, id = obj.archive.substr(obj.archive.lastIndexOf('/') + 1);
        
        if(grenier.isNotifNativeSet()) {
		    chrome.notifications.create("sdz_" + id, notifOptions, function() { // Etant donné que l'ID est unique, la notif ne s'affiche pas 2 fois
		        //console.log("Callback");
		    });
        }
	}
	grenier.saveLastNotifs(tab);
}

/*
// Notifications chrome
chrome.notifications.onButtonClicked.addListener(function(notif, button) {
    var notifId = notif.substr(4),
        notifs = grenier.getLastNotifs(),
        notifObj = false;
    
    for(var i = 0; i < notifs.length; i++) {
        if(notifs[i].archive == "/notifications/archiver/" + notifId) {
            notifObj = notifs[i];
            break; //gagne du temps dans la boucle
        }
    }
    
    if(notifObj) {
        chrome.notifications.clear(notif,function(wasCleared){});
        if(button == 0) { //bouton "voir"
            chrome.tabs.create({'url': "http://www.siteduzero.com" + notifObj.lien});
        }
        
        //else if(button == 1) { //bouton "archiver"
            //console.log("lol");
        //}
    }
});
*/

