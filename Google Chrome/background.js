var Notificateur = function() {
    this.init.apply(this, arguments);
};

Notificateur.prototype = {
    url: "http://www.siteduzero.com",
    
    logged: true, //savoir si le dernier statut est connecté ou déconnecté
    
    isLogged: function() {return this.logged;},
    
    options: {
        updateInterval: 5,
		openListe: true,
        openInNewTab: true,
        showAllNotifButton: true,
        showDesktopNotif: true,
        useDetailedNotifs: false
    },
    
    storage: chrome.storage.sync,
    
    init: function() {
        this.notifications = []; //tableau stockant les notifs
        this.MPs = []; //tableau stockant les MPs
        this.loadOptions(function() {
    		//action lorsqu'on click sur le bouton (affichage liste ou chargement SdZ
    		if(!this.options.openListe) { //soit on ouvre le SdZ
    			chrome.browserAction.setPopup({popup:""});
    			chrome.browserAction.onClicked.addListener(this.listeners.toolbarClick.bind(this));
    		} else { //sinon on ouvre une popup avec le contenu des notifs
    			chrome.browserAction.setPopup({popup:"popup.html"});
    		}
    		
            chrome.alarms.create('refresh', {periodInMinutes: parseInt(this.options.updateInterval)});
            
            this.initListeners();
            
            this.check();
        }.bind(this));
    },
    
    initListeners: function() {
        if(chrome.tabs) {
            chrome.tabs.onUpdated.addListener(this.listeners.tabUpdate.bind(this));
            chrome.tabs.onCreated.addListener(this.listeners.tabCreate.bind(this));
        }
        
        if(chrome.alarms) {
            chrome.alarms.onAlarm.addListener(this.listeners.alarm.bind(this));
        }
        
        if(chrome.notifications) {
            chrome.notifications.onButtonClicked.addListener(this.listeners.notifButtonClick.bind(this));
            chrome.notifications.onClicked.addListener(this.listeners.notifClick.bind(this));
            chrome.notifications.onClosed.addListener(this.listeners.notifClose.bind(this));
        }
    },
    
    listeners: {
        tabUpdate: function(tabId, changeInfo, tab) {
            if(tab.url !== undefined && tab.url.indexOf("siteduzero.com") != -1 && tab.url.indexOf("siteduzero.com") < 14 && changeInfo.status == "complete") {
                chrome.tabs.executeScript(tabId, {
                    file: "injected.js"
                });
                
                this.check();
            }
        },
        
        tabCreate: function(tab) {
            if(tab.url !== undefined && tab.url.indexOf("siteduzero.com") != -1 && tab.url.indexOf("siteduzero.com") < 14) {
                this.check();
            }
        },
        
        toolbarClick: function() {
            chrome.tabs.create({
    				'url': this.url,
    				'active': true
    			});
        },
        
        alarm: function(alarm) {
            if (alarm.name == 'refresh') {
                this.check();
            }
        },
        
        notifButtonClick: function(notifId, button) {
            var notif = this.getNotification(parseInt(notifId));
            if(button == 0) { // Open last message
                if(notif) {
                    if(notif.isBadge)
                        this.openSdZ("/membres/" + notif.messageId);
                    else
                        this.openSdZ("/forum/sujet/" + notif.thread + "/" + notif.messageId);
                }
                
                chrome.notifications.clear(notifId, function() {
                    
                });
            }
            else if(button == 1) { // Open thread
                if(notif) {
                    this.openSdZ("/forum/sujet/" + notif.thread);
                }
                
                chrome.notifications.clear(notifId, function() {
                    
                });
            }
        },
        
        notifClick: function(notifId) {
            var notif = this.getNotification(parseInt(notifId));
            if(notif) {
                if(notif.isBadge)
                    this.openSdZ("/membres/" + notif.messageId);
                else
                    this.openSdZ("/forum/sujet/" + notif.thread + "/" + notif.messageId);
            }
            
            chrome.notifications.clear(notifId, function() {
                
            });
        },
        
        notifClose: function(notifId) {
            // A la fermeture de la notif
        }
    },
    
    check: function() {
        $.get(this.url, this.loadCallback.bind(this), "text");
    },
    
    getNotification: function(id) {
        if(id) {
            for(var i = 0; i < this.notifications.length; i++) {
                if(this.notifications[i].id == id) {
                    return this.notifications[i];
                }
            }
            
            return false;
        }
        else {
            return this.notifications;
        }
    },
    
    //ancien "verifNotif()"
    loadCallback: function(data) {

        var self = this,
            xmlDoc = new DOMParser().parseFromString(data, "text/xml"), 
            $data = $(xmlDoc),
            loginBox = $($data).find("div#login");
            
        //on est pas connecté !
        if(loginBox.length != 0) {
            if(this.logged) {
                chrome.browserAction.disable();
                chrome.browserAction.setBadgeText({text: ""});
                chrome.browserAction.setIcon({"path":"icons/icone_38_logout.png"});
                chrome.alarms.clear('refresh');
                this.logged = false;
            }
            return;
        } else {
            if(!this.logged) {
                chrome.browserAction.enable();
                chrome.browserAction.setIcon({"path":"icons/icone_38.png"});
                chrome.alarms.create('refresh', {periodInMinutes: parseInt(this.options.updateInterval)});
                chrome.alarms.onAlarm.addListener(this.listeners.alarm.bind(this));
                this.logged = true;
            }
        }
        
        // Check les MPs
        var MPs = $data.find("ul.privateMessagesList"),
            newMPs = [], // Liste des nouvelles notifications
            oldMPs = this.notifications, // Ancienne liste
            removedMPs = [], // Notifs enlevées
            MPsList = []; // Nouvelle liste
            
         //a remplir, besoin de plus de donnée concernant les MPs
            
            
            
            
        
        // Check les notifications
        var notifications = $data.find("div#scrollMe ul.list li.notification"),
            newNotifs = [], // Liste des nouvelles notifications
            oldNotifs = this.notifications, // Ancienne liste
            removedNotifs = [], // Notifs enlevées
            notifsList = []; // Nouvelle liste
        
        for(var i = 0; i < notifications.length; i++) {
            var notif = $(notifications[i]),
                notifLink = notif.find("a.link").attr('href'),
                archiveLink = notif.find("a.delete").attr('href');
            
            var notifObj = {
                id: archiveLink.substr(archiveLink.lastIndexOf("/") + 1),
                title: notif.find("li.title").text(),
                date: notif.find("li.date").text(),
                messageId: notifLink.substr(notifLink.lastIndexOf("/") + 1),
                thread: notifLink.substr(13, notifLink.lastIndexOf("/") - 13),
                isBadge: notif.find("a.badgeSdz").text().length==0 ? false : true //si c'est un badge
            };
                        
            var existingNotif = this.getNotification(notifObj.id);
            if(existingNotif) {
                $.extend(notifObj, existingNotif);
            }
            else {
                newNotifs.push(notifObj);
                this.newNotifCallback && this.newNotifCallback(notifObj);
            }
            
            if(this.options.useDetailedNotifs && !notifObj.detailed && !notifObj.isBadge) {
                this.fetchNotificationDetails(notifObj, function(newNotif) {
                    $.extend(notifObj, newNotif);
                    console.log("Detail fectched", newNotif);
                    self.showDesktopNotif(notifObj);
                });
            }
            else if(!existingNotif) {
                this.showDesktopNotif(notifObj);
            }
            
            notifsList.push(notifObj);
        }
        
        this.notifications = notifsList;
        
        for(var i = 0; i < oldNotifs.length; i++) { // Faire la liste des notifs enlevées
            var exists = false;
            for(var j = 0; j < this.notifications.length; j++) {
                if(oldNotifs[i].id == this.notifications[j].id) {
                    exists = true;
                    break;
                }
            }
            if(!exists) {
                removedNotifs.push(oldNotifs[i]);
                this.removeNotifCallback && this.removeNotifCallback(oldNotifs[i]);
            }
        }
        
        console.log("Update", {
            newNotifs: newNotifs,
            removedNotifs: removedNotifs,
            notifs: this.notifications
        });
        
        this.clearDesktopNotifs(removedNotifs);
        
        //set le texte du badge
        var badgeTexte = this.MPs.length > 0 ? this.MPs.length.toString() + " - " : "";
            badgeTexte += (this.notifications.length > 0) ? this.notifications.length.toString() : "";
        chrome.browserAction.setBadgeText({text: badgeTexte});
    },
    
    showDesktopNotif: function(notif) {
        if(typeof notif == "Array") {
            for(var i = 0; i < notif.length; i++) {
                this.showDesktopNotif(notif[i]);
            }
            return;
        }
        
        if(chrome.notifications && this.options.showDesktopNotif) {
            if(this.options.useDetailedNotifs && notif.detailed && !notif.isBadge) {
                var notifOptions = {};
                
                chrome.notifications.create(notif.id, {
                    type: "basic",
                    iconUrl: notif.avatarUrl,
                    title: notif.author + " - " + notif.threadTitle,
                    message: notif.postContent.replace(/<br \/>/ig, "\n").replace(/(<([^>]+)>)/ig, "").substr(0, 140) + "...\n" + notif.date,
                    buttons: [{ title: "Voir le message" }, { title: "Voir le début du thread"}]
                }, function() {});
            }
            else {
                var boutons = new Array();
                var icone = "";
                boutons[0] = { title: "Voir le message" };
                if(!notif.isBadge) {
                    boutons[1] = { title: "Voir le début du thread" };
                    icone = "icons/big_message.png";
                } else {
                    icone = "icons/big_badge.png";
                }
                var notifOptions = { // Options des notifications
                    type: "basic",
                    iconUrl: icone,
                    title: notif.title,
                    message: notif.date,
                    buttons: boutons
                };
                
                chrome.notifications.create(notif.id, notifOptions, function() {});
            }
        }
    },
    
    clearDesktopNotifs: function(notifs) {
        if(chrome.notifications) {
            for(var i = 0; i < notifs.length; i++) {
                chrome.notifications.clear(notifs[i].id, function() {});
            }
        }
    },
    
    fetchNotificationDetails: function(notif, callback) {
        if(typeof notif == "Array") {
            for(var i = 0; i < notif.length; i++) {
                this.fetchNotificationDetails(notif[i], function(newNotif) {
                    callback && callback(newNotif, i);
                });
            }
            
            return;
        }
        
        $.get(this.url + "/forum/sujet/" + notif.thread + "/" + notif.messageId, function(_data) {
            data = _data.replace(/src=/ig, "data-src=").replace(/href=/ig, "data-href="); // <-- pas forcement la meilleur methode... marche pas si qqn a un nom/avatar avec src=/href= dans le nom
            //data = data.replace(/<img\b[^>]*>(.*?)<\/img>/ig,'');
            //data = data.replace(/<head\b[^>]*>(.*?)<\/head>/ig,'');
            //var xmlDoc = new DOMParser().parseFromString(data, "text/xml"); <-- Le parser bug...
            var $data = $(data);
            var post = $data.find("#message-" + notif.messageId).parent();
            if(post.length == 1) {
                var authorElem = post.find(".avatar .author a");
                var author = $.trim(authorElem.text());
                var authorUrl = authorElem.attr("data-href"); // URL de l'auteur sans le /membres/
                var avatarUrl = post.find(".avatar img[alt=\"avatar\"]").attr("data-src");
                var postContent = post.find(".content .markdown").text();
                var threadTitle = $(data.match(/<title>[\n\r\s]*(.*)[\n\r\s]*<\/title>/gmi)[0]).text() // <-- Un peu hard, je sais ^^
                notif.author = author;
                notif.avatarUrl = avatarUrl;
                notif.authorUrl = authorUrl;
                notif.postContent = postContent;
                notif.threadTitle = threadTitle;
                notif.detailed = true;
                
                if(!notif.avatarUrl.indexOf("http") == 0) { // <-- URL relative
                    notif.avatarUrl = "http://siteduzero.com" + notif.avatarUrl;
                }
            }
            else {
                notif.detailed = false;
            }
            
            callback && callback(notif);
        }, "text");
    },
    
    getOptions: function(key) {
        if(key) {
            return this.options[key];
        }
        else {
            return this.options;
        }
    },
    
    setOptions: function(changes, callback) {
        callback = callback || function() { console.log("Options saved"); };
        for(var key in changes) {
            if(this.options[key] !== undefined) {
                this.options[key] = changes[key];
            }
        }
        this.storage.set(this.options, callback);
        this.updateOptions();
    },
    
    loadOptions: function(callback) { // Charge les options depuis le chrome.storage
        var self = this,
            keys = Object.keys(this.options);
        this.storage.get(keys, function(items) {
            for(var key in items) {
                if(self.options[key]) {
                    self.options[key] = items[key];
                }
            }
            
            (typeof callback == "function") && callback();
        });
    },
    
    updateOptions: function() {
        // Update interval
        chrome.alarms.create('refresh', { periodInMinutes: parseInt(this.options.updateInterval) });
		
		//action lorsqu'on click sur le bouton (affichage liste ou chargement SdZ
		if(!this.options.openListe) { //soit on ouvre le SdZ
			chrome.browserAction.setPopup({popup:""});
			chrome.browserAction.onClicked.addListener(this.listeners.toolbarClick.bind(this));
		} else { //sinon on ouvre une popup avec le contenu des notifs
			chrome.browserAction.onClicked.removeListener(this.listeners.toolbarClick);
			chrome.browserAction.setPopup({popup:"popup.html"});
		}
    },
    
    setNewNotifCallback: function(callback) {
        if(typeof callback == "function") {
            this.newNotifCallback = callback;
        }
        else {
            this.newNotifCallback = undefined;
        }
    },
    
    setRemoveNotifCallback: function(callback) {
        if(typeof callback == "function") {
            this.removeNotifCallback = callback;
        }
        else {
            this.removeNotifCallback = undefined;
        }
    },
    
    openSdZ: function(_url) {
        var url = this.url + _url,
            self = this;
        
        chrome.windows.getCurrent({ populate:true }, function(currentWindow) {
            var tab = false;
            for(var i in currentWindow.tabs) {
                if(currentWindow.tabs[i].active) {
                    tab = currentWindow.tabs[i];
                    break;
                }
            }
            
            if(!self.getOptions("openInNewTab") && tab && tab.url !== undefined && tab.url.indexOf("siteduzero.com") != -1 && tab.url.indexOf("siteduzero.com") < 14) {
                chrome.tabs.update(tab.id, { url: url });
            }
            else {
                chrome.tabs.create({
                    'url': url,
                    'active': false
                });
            }
        });
    }
};

var theNotificator = new Notificateur();
