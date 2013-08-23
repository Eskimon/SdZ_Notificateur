var notificator;

var linkListener = function(notificator, event) {
    var url = $(event.currentTarget).attr("href");
    if(url == "#") return;

    event.preventDefault();

    var parent = $(event.currentTarget).closest('div'); //trouve l'id du parent
    var isShortcut = $(parent).hasClass("allNotifs");
    if(!isShortcut) {
        var id = $(parent).attr('id').slice(6);
        var isAlerte = $(parent).hasClass("alerte");
        var isArchivable = $(parent).hasClass("forum") || $(parent).hasClass("badge");
    }
    
    //console.log(url);
    chrome.windows.getCurrent({ populate: true }, function(currentWindow) {
        var tab = false;
        for(var i in currentWindow.tabs) {
            if(currentWindow.tabs[i].active) {
                tab = currentWindow.tabs[i];
                break;
            }
        }
        if(!notificator.getOptions("openInNewTab") && tab && tab.url !== undefined && tab.url.indexOf("siteduzero.com") != -1 && tab.url.indexOf("siteduzero.com") < 14) {
            if(isAlerte) {
                notificator.alertTabId.push(tab.id);
            }
            chrome.tabs.update(tab.id, { url: url });
            if(isArchivable)
                archiver(id, parent);
        }
        else {
            chrome.tabs.create({
                'url': url,
                'active': false
            }, function(tab){
                if(isAlerte) {
                    notificator.alertTabId.push(tab.id); //on ajout l'id du tab
                }
                if(isArchivable)
                    archiver(id, parent);
            });
        }

        if(notificator.getOptions("autoclosePopup")) {
            window.close();
        }
    });
}

var createNotif = function(notif) {
    var elem = $("<div>", { class: "element", id: "notif-" + notif.id }),
        notifLink = $("<a>").appendTo(elem);
                    
    switch(notif.type) {
        case("forum"): //message
            elem.addClass("forum");
            $("<span>", { class: "delete" }).text('x').prependTo(elem);
            notifLink.attr("href", 'http://www.siteduzero.com/forum/sujet/' + notif["thread"] + '/' + notif["messageId"]); 
            break;
        case("badge"): //badge
            elem.addClass("badge");
            $("<span>", { class: "delete" }).text('x').prependTo(elem); 
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

var linkArchiveur = function(notificator, event) {
    event.preventDefault();
    var parent = $(event.currentTarget).closest('div'); //trouve l'id du parent
    var id = $(parent).attr('id').slice(6);
    
    archiver(id, parent);
};

var archiver = function(id, parent) {
    //l'idéal serait d'envoyer le remove en callback de succès... mais la flemme
    notificator.archiveNotification(id);
    $(parent).remove();
};

var archiveAll = function() {
    notificator.archiveAll(function() {
        $(".archiveAll").text("Fait!").delay(1000).slideUp();
    });

    $(".archiveAll").text("En cours...");
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
            //ligne "Archiver toutes les notifications"
            if(notificator.getOptions("archiveAllLink")) {
                $("<div>", { class: "archiveAll" }).append(
                    $("<a>", { href: "#" }).text("Tout archiver").click(archiveAll)
                ).appendTo(content);
                $("<hr>").appendTo(content);
            }

            for(var i = 0; i < len; i++) {
                var n = createNotif(notifs[i]).appendTo(notifList);
                if(i<len-1)
                    $("<hr>").appendTo(notifList).attr("id", "hr-notif-" + notifs[i].id);
            }
        }
        
        notifList.appendTo(content);
        
        //ligne "Afficher toute les notifications"
        if(notificator.getOptions("showAllNotifButton")) {
            $("<hr>").appendTo(content);
            $("<div>", { class: "allNotifs" }).append(
                $("<a>", { href: "http://www.siteduzero.com/notifications" }).text("Toutes mes notifications")
            ).appendTo(content);
        }
        
        //ligne "Ouvrir le SdZ"
        if(notificator.getOptions("SdZLink")) {
            $("<hr>").appendTo(content);
            $("<div>", { class: "allNotifs" }).append(
                $("<a>", { href: "http://www.siteduzero.com/" }).text("Aller au SdZ")
            ).appendTo(content);
        }
        
        var liens = document.getElementsByTagName("a");
        for (var i = 0; i < liens.length; i++) {
            $(liens[i]).on("click", linkListener.bind(this, notificator));
        }
        
        liens = document.getElementsByTagName("span");
        for (var i = 0; i < liens.length; i++) {
            $(liens[i]).on("click", linkArchiveur.bind(this, notificator));
        }
        
        notificator.setNewNotifCallback(function(notif) {
            $(".noNotifs").hide();
            if(notifList.children().length > 0) {
                $("<hr>").appendTo(notifList);
            }
            createNotif(notif).appendTo(notifList).find("a").on("click", linkListener.bind(this, notificator));
        });
        
        notificator.setRemoveNotifCallback(function(notif) {
            var n = notifList.find("#notif-" + notif.id);
            if(n.length == 1) {
                n.slideUp(function() {
                    $(this).remove();
                });
            }
            notifList.find("#hr-notif-" + notif.id).remove();
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
