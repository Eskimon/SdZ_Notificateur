document.addEventListener('DOMContentLoaded', function () {
	var notifs = grenier.getLastNotifs();
	
	chrome.runtime.getBackgroundPage(function(bgWindow) { // Recuperer le background
        var notifs = bgWindow.theNotificator.getNotification();
        
        var len = notifs.length;
    	var content = "";
    	
    	if(len == 0) {
    		content += '<div class="allNotifs">Aucune nouvelle notifications</div>';
    	} else {
    		for(var i=0; i<len; i++) {
    			content += '<a href="http://www.siteduzero.com/forum/sujet/' + notifs[i]["thread"] + '/' + notifs[i]["messageId"] + '" data-archive="http://www.siteduzero.com'+ notifs[i]["archive"] + '"><div class="element">';
    			content += '<p class="titre">';
    			content += notifs[i]["title"];
    			content += "</p>";
    			content += '<p class="temps">' + notifs[i]["date"] + '</p>';
    			content += "</div></a>";
    			content += '<a class="test" href="http://www.siteduzero.com/notifications/archiver/' + notifs[i]["id"] + '"></a>';
    			if(i<len-1)
    				content += '<hr />';
    		}
    	}
    	
    	if(grenier.isAllNotifsSet()) {
    		content += '<hr />';
    		content += '<a href="http://www.siteduzero.com/notifications">\
    			<div class="allNotifs">Toutes mes notifications</div></a>';
    	}
    	
    	document.getElementById('content').innerHTML = content;
    	
    	//enregistre les liens pour détecter les clicks et les renvoyer vers la page correspondante
    	var liens = document.getElementsByTagName("a");
    	var len = liens.length;
    	for (var i=0; i < len; i++) {
        	liens[i].addEventListener("click", function (event) {
                event.preventDefault();
    			//ouvre nouveau tab
    			chrome.tabs.create({
    				'url':this.href,
    				'active': false
    			});
            }, false);
    	}
    });
});
