document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.getBackgroundPage(function(bgWindow) {
        var notificator = bgWindow.theNotificator,
            notifs = notificator.getNotification();
        
        var len = notifs.length;
        var content = $("#content");
        
        var notifList = $("<div>", { class: "notifList" });
        
        if(len == 0 && !notificator.newRoadmap) {
            $("<div>", { class: "noNotifs" }).text("Aucune nouvelle notifications").appendTo(content);
        } else {
            for(var i = 0; i < len; i++) {
                var elem, notifLink;
                
                switch(notifs[i].type) {
                    case(0): //message
                        elem = $("<div>", { class: "element message", id: "notif-" + notifs[i].id }).appendTo(notifList);
                        notifLink = $("<a>", { href: 'http://www.siteduzero.com/forum/sujet/' + notifs[i]["thread"] + '/' + notifs[i]["messageId"] }).appendTo(elem);
                        break;
                    case(1): //badge
                        elem = $("<div>", { class: "element badge", id: "notif-" + notifs[i].id }).appendTo(notifList);
                        notifLink = $("<a>", { href: 'http://www.siteduzero.com/membres/' + notifs[i]["messageId"]}).appendTo(elem);
                        break;
                    case(2): //MP
                    
                        break;
                    case(3): //roadmap
                        elem = $("<div>", { class: "element roadmap", id: "notif-" + notifs[i].id }).appendTo(notifList);
                        notifLink = $("<a>", { href: 'http://www.siteduzero.com/p/roadmap-du-site-du-zero' }).appendTo(elem);
                        break;
                }
                    
                $("<div>", { class: "titre" }).text(notifs[i]["title"]).appendTo(notifLink);
                $("<div>", { class: "date" }).text(notifs[i]["date"]).appendTo(notifLink);
                
                if(i<len-1)
                    $("<hr>").appendTo(notifList);
            }
        }
        
        notifList.appendTo(content);
        
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
                chrome.windows.getCurrent({ populate: true }, function(currentWindow) {
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
        
        notificator.setNewNotifCallback(function(notif) {
            $(".noNotifs").hide();
            if(notifList.children().length > 0) {
                $("<hr>").appendTo(notifList);
            }
            
            var elem = $("<div>", { class: "element", id: "notif-" + notif.id }).appendTo(notifList),
                notifLink = $("<a>", { href: 'http://www.siteduzero.com/forum/sujet/' + notif["thread"] + '/' + notif["messageId"] }).appendTo(elem);
            
            $("<div>", { class: "titre" }).text(notif["title"]).appendTo(notifLink);
            $("<div>", { class: "date" }).text(notif["date"]).appendTo(notifLink);
        });
        
        notificator.setRemoveNotifCallback(function(notif) {
            var n = notifList.find("#notif-" + notif.id);
            if(n.length == 1) {
                n.remove();
            }
        });
    });
});
