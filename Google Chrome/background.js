var Notificateur = function() {
    this.init.apply(this, arguments);
};

Notificateur.prototype = {
    url: "http://www.siteduzero.com",
    
    options: {
        updateInterval: 5,
        openInNewTab: true,
        showAllNotifButton: true,
        showDesktopNotif: true
    },
    
    storage: chrome.storage.sync,
    
    init: function() {
        this.notifications = [];
        this.loadOptions();
        this.initListeners();
        this.check();
        
        chrome.alarms.create('refresh', {periodInMinutes: this.options.updateInterval});
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
        
        chrome.storage.onChanged.addListener(this.listeners.storageChanged.bind(this));
    },
    
    listeners: {
        tabUpdate: function(tabId, changeInfo, tab) {
            if(tab.url !== undefined && tab.url.indexOf("siteduzero.com") != -1 && tab.url.indexOf("siteduzero.com") < 14 && changeInfo.status == "complete") {
                //on vire la notif sur le SdZ
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
            this.openSdZ();
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
                this.openSdZ("/forum/sujet/" + notif.thread + "/" + notif.messageId);
            }
            
            chrome.notifications.clear(notifId, function() {
                
            });
        },
        
        notifClose: function(notifId) {
            // A la fermeture de la notif
        },
        
        storageChanged: function(changes, areaName) {
            console.log(this.options);
            for(var key in changes) {
                if(this.options[key]) {
                    this.options[key] = changes[key].newValue;
                }
            }
            console.log(this.options);
            this.updateOptions();
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

        var xmlDoc = new DOMParser().parseFromString(data, "text/xml"),
            $data = $(xmlDoc),
            loginBox = $(data).find("div#login");
            
		//on est pas connecté !
		if(loginBox.length != 0) {
			chrome.browserAction.disable();
			chrome.browserAction.setBadgeText({text: ""});
			chrome.browserAction.setIcon({"path":"icons/icone_38_logout.png"});
			
			return;
		} else {
			chrome.browserAction.enable();
			chrome.browserAction.setIcon({"path":"icons/icone_38.png"});
		}
            
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
                thread: notifLink.substr(13, notifLink.lastIndexOf("/") - 13)
            };
            
            if(this.getNotification(notifObj.id) == false) {
                newNotifs.push(notifObj);
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
            }
        }
        
        console.log("Update", {
            newNotifs: newNotifs,
            removedNotifs: removedNotifs,
            notifs: this.notifications
        });
        
        this.showDesktopNotifs(newNotifs);
        this.clearDesktopNotifs(removedNotifs);
        
        chrome.browserAction.setBadgeText({
            text: (this.notifications.length > 0) ? this.notifications.length.toString() : ""
        });
    },
    
    showDesktopNotifs: function(notifs) {
        var notifOptions = { // Options des notifications
            type: "basic",
            iconUrl: "icons/icone_48.png",
            buttons: [{ title: "Voir le message" }, { title: "Voir le début du thread"}]
        };
        
        if(chrome.notifications && this.options.showDesktopNotif) {
            for(var i = 0; i < notifs.length; i++) {
                notifOptions.title = notifs[i].title;
                notifOptions.message = notifs[i].date;
                chrome.notifications.create(notifs[i].id, notifOptions, function() {});
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
    
    getOptions: function(key) {
        if(key) {
            return this.options[key];
        }
        else {
            return this.options;
        }
    },
    
    loadOptions: function() { // Charge les options depuis le chrome.storage
        var self = this,
            keys = Object.keys(this.options);
        this.storage.get(keys, function(items) {
            for(var key in items) {
                if(self.options[key]) {
                    self.options[key] = items[key];
                }
            }
        });
    },
    
    updateOptions: function() {
        // Update interval
        chrome.alarms.clear('refresh');
        chrome.alarms.create('refresh', { periodInMinutes: this.options.updateInterval });
    },
    
    openSdZ: function(url) {
        chrome.tabs.create({ 'url': this.url + url });
    }
};

var theNotificator = new Notificateur();
