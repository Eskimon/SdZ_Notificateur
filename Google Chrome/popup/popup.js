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

var createNotif = function(notif) {
    var elem = $("<div>", { class: "element", id: "notif-" + notif.id }),
        notifLink = $("<a>").appendTo(elem);
                    
    switch(notif.type) {
        case("forum"): //message
            elem.addClass("forum");
            notifLink.attr("href", 'http://www.siteduzero.com/forum/sujet/' + notif["thread"] + '/' + notif["messageId"]);
            break;
        case("badge"): //badge
            elem.addClass("badge");
            notifLink.attr("href", 'http://www.siteduzero.com/membres/' + notif["messageId"]);
            break;
        case("mp"): //MP
            elem.addClass("mp");
            notifLink.attr("href", 'http://www.siteduzero.com/mp/' + notif["thread"] + '/' + notif["messageId"]);
            break;
        case("roadmap"): //roadmap
            elem.addClass("roadmap");
            notifLink.attr("href", 'http://www.siteduzero.com/p/roadmap-du-site-du-zero');
            break;
        case("alerte"): //alerte
            elem.addClass("alerte");
            notifLink.attr("href", 'http://www.siteduzero.com/forum/sujet/' + notif["thread"] + '/' + notif["messageId"]).addClass("alerte");
            break;
    }
        
    $("<div>", { class: "titre" }).text(notif["title"]).appendTo(notifLink);
    $("<div>", { class: "date" }).text(notif["date"]).appendTo(notifLink);
    
    return elem;
};

var backgroundLoaded = function(bgWindow) {
    if(!bgWindow || !bgWindow.theNotificator) {
        console.error("Failed to load background");
        return;
    }
    notificator = bgWindow.theNotificator;
    var notifs = notificator.getNotification();
    
    if(notificator.logged || notificator.useFakeData) {
        var len = notifs.length;
        var content = $("#content");
        
        var notifList = $("<div>", { class: "notifList" });
        
        if(len == 0 && !notificator.newRoadmap) {
            $("<div>", { class: "noNotifs" }).text("Aucune nouvelle notifications").appendTo(content);
        } else {
            for(var i = 0; i < len; i++) {
                createNotif(notifs[i]).appendTo(notifList);
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
            createNotif(notif).appendTo(notifList);
        });
        
        notificator.setRemoveNotifCallback(function(notif) {
            var n = notifList.find("#notif-" + notif.id);
            if(n.length == 1) {
                n.remove();
            }
        });
    }
    else {
        var content = $("#content");
        $("<div>", { class: "not-connected"}).html("Vous n'&ecirc;tes pas connect&eacute;!").appendTo(content);
    }
};

document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.getBackgroundPage(function() {
        backgroundLoaded.apply(this, arguments);
    });
});