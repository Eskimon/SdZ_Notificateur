var notificator;

var linkListener = function(notificator, event) {
    event.preventDefault();
    var url = $(event.currentTarget).attr("href");
    var isAlerte = $(event.currentTarget).hasClass("alerte");
    console.log(url);
    chrome.windows.getCurrent({ populate: true }, function(currentWindow) {
        var tab = false;
        for(var i in currentWindow.tabs) {
            if(currentWindow.tabs[i].active) {
                tab = currentWindow.tabs[i];
                break;
            }
        }
        // /!\ traitement particulier à prévoir si c'est une alerte !
        if(!notificator.getOptions("openInNewTab") && tab && tab.url !== undefined && tab.url.indexOf("siteduzero.com") != -1 && tab.url.indexOf("siteduzero.com") < 14) {
            if(isAlerte) {
                notificator.alertTabId.push(tab.id);
            }
            chrome.tabs.update(tab.id, { url: url });
        }
        else {
            chrome.tabs.create({
                'url': url,
                'active': false
            }, function(tab){
                if(isAlerte) {
                    notificator.alertTabId.push(tab.id); //on ajout l'id du tab
                }
            });
        }
    });
}


document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.getBackgroundPage(function(bgWindow) {
        notificator = bgWindow.theNotificator,
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
                    case("forum"): //message
                        elem = $("<div>", { class: "element forum", id: "notif-" + notifs[i].id }).appendTo(notifList);         
                        $("<span>", { class: "delete" }).text('x').appendTo(elem);
                        notifLink = $("<a>", { href: 'http://www.siteduzero.com/forum/sujet/' + notifs[i]["thread"] + '/' + notifs[i]["messageId"] }).appendTo(elem);
                        break;
                    case("badge"): //badge
                        elem = $("<div>", { class: "element badge", id: "notif-" + notifs[i].id }).appendTo(notifList);
                        $("<span>", { class: "delete" }).text('x').appendTo(elem);
                        notifLink = $("<a>", { href: 'http://www.siteduzero.com/membres/' + notifs[i]["messageId"]}).appendTo(elem);
                        break;
                    case("mp"): //MP
                        elem = $("<div>", { class: "element mp", id: "notif-" + notifs[i].id }).appendTo(notifList);
                        notifLink = $("<a>", { href: 'http://www.siteduzero.com/mp/' + notifs[i]["thread"] + '/' + notifs[i]["messageId"] }).appendTo(elem);
                        break;
                    case("roadmap"): //roadmap
                        elem = $("<div>", { class: "element roadmap", id: "notif-" + notifs[i].id }).appendTo(notifList);
                        notifLink = $("<a>", { href: 'http://www.siteduzero.com/p/roadmap-du-site-du-zero' }).appendTo(elem);
                        break;
                    case("alerte"): //alerte
                        elem = $("<div>", { class: "element alerte", id: "notif-" + notifs[i].id }).appendTo(notifList);
                        notifLink = $("<a>", { href: 'http://www.siteduzero.com/forum/sujet/' + notifs[i]["thread"] + '/' + notifs[i]["messageId"], class: "alerte" }).appendTo(elem);
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
            $(liens[i]).on("click", linkListener.bind(this, notificator));
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
            notifLink.on("click", notifLink.bind(this, notificator));
        });
        
        notificator.setRemoveNotifCallback(function(notif) {
            var n = notifList.find("#notif-" + notif.id);
            if(n.length == 1) {
                n.remove();
            }
        });
    });
});
