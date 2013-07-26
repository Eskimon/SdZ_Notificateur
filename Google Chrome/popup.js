document.addEventListener('DOMContentLoaded', function () {
	chrome.runtime.getBackgroundPage(function(bgWindow) { // Recuperer le background
        var notificator = bgWindow.theNotificator,
            notifs = notificator.getNotification();
        
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
    	
    	if(notificator.getOptions("showAllNotifButton")) {
    		content += '<hr />';
    		content += '<a href="http://www.siteduzero.com/notifications">\
    			<div class="allNotifs">Toutes mes notifications</div></a>';
    	}
    	
    	document.getElementById('content').innerHTML = content;
    	
    	//enregistre les liens pour détecter les clicks et les renvoyer vers la page correspondante
    	var liens = document.getElementsByTagName("a");
    	for (var i = 0; i < liens.length; i++) {
        	liens[i].addEventListener("click", function (event) {
                event.preventDefault();
                var url = this.href;
        	    chrome.windows.getCurrent({ populate:true }, function(currentWindow) {
        	        var tab = false;
        	        for(var i in currentWindow.tabs) {
            	        if(currentWindow.tabs[i].active) {
                	        tab = currentWindow.tabs[i];
                	        break;
            	        }
        	        }
        	        
            	    if(!notificator.getOptions("openInNewTab") && tab && tab.url !== undefined && tab.url.indexOf("siteduzero.com") != -1 && tab.url.indexOf("siteduzero.com") < 14) {
            			chrome.tabs.update(tab.id, { url: url });
        			}
        			else {
        			    chrome.tabs.create({
            				'url': url,
            				'active': false
            			});
        			}
        	    });
            }, false);
    	}
    });
});
