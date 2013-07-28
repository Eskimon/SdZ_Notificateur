document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.getBackgroundPage(function(bgWindow) {
        var notificator = bgWindow.theNotificator,
            notifs = notificator.getNotification();
        
        var len = notifs.length;
        var content = $("#content");
        
        if(len == 0) {
            $("<div>", { class: "noNotifs" }).text("Aucune nouvelle notifications").appendTo(content);
        } else {
            var notifList = $("<div>", { class: "notifList" }).appendTo(content);
            for(var i=0; i<len; i++) {
                var elem = $("<div>", { class: "element", id: "notif-" + notifs[i].id }).appendTo(notifList),
                    notifLink = $("<a>", { href: 'http://www.siteduzero.com/forum/sujet/' + notifs[i]["thread"] + '/' + notifs[i]["messageId"] }).appendTo(elem);
                
                $("<div>", { class: "titre" }).text(notifs[i]["title"]).appendTo(notifLink);
                $("<div>", { class: "date" }).text(notifs[i]["date"]).appendTo(notifLink);
                
                if(i<len-1)
                    $("<hr>").appendTo(content);
            }
        }
        
        if(notificator.getOptions("showAllNotifButton")) {
            $("<hr>").appendTo(content);
            $("<div>", { class: "allNotifs" }).append(
                $("<a>", { href: "http://www.siteduzero.com/notifications" }).text("Toutes mes notifications")
            ).appendTo(content);
        }
        
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
