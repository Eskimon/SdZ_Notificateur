var Notificateur = function() {
    this.init.apply(this, arguments);
};

Notificateur.prototype = {
    url: "http://www.siteduzero.com",
    init: function() {
        this.notifications = [];
        this.initListeners();
        this.check();
        
        chrome.alarms.create('refresh', {periodInMinutes: 1});
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
            if((typeof tab.url !== 'undefined') && (tab.url.substring(0, this.url.length) == this.url) && (changeInfo.status == "complete")) {
                //on vire la notif sur le SdZ
                chrome.tabs.executeScript(tabId, {
                    file: "injected.js"
                });
                
                this.check();
            }
        },
        
        tabCreate: function(tab) {
            if((typeof tab.url !== 'undefined') && (tab.url.substring(0, this.url.length) == this.url)) {
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
            if(button == 0) {
                var notif = this.getNotification(parseInt(notifId));
                if(notif) {
                    this.openSdZ("/forum/sujet/" + notif.thread + "/" + notif.messageId);
                }
                
                chrome.notifications.clear(notifId, function() {
                    
                });
            }
        },
        
        notifClick: function(notifId) {
            
        },
        
        notifClose: function(notifId) {
            // A la fermeture de la notif
        }
    },
    
    check: function() {
        var self = this;
        $.get(this.url, function(data) {
            self.loadCallback(data);
        }, "text");
        
        console.log("Checking");
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
    
    loadCallback: function(data) {
        var xmlDoc = new DOMParser().parseFromString(data, "text/xml"),
            $data = $(xmlDoc),
            notifications = $data.find("div#scrollMe ul.list li.notification"),
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
                if(oldNotifs[i].id == this.notifications[i].id) {
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
        
        chrome.browserAction.setBadgeText({
            text: (this.notifications.length > 0) ? this.notifications.length.toString() : ""
        });
    },
    
    showDesktopNotifs: function(notifs) {
        var notifOptions = { // Options de la notification
            type: "basic",
            iconUrl: "icons/icone_48.png",
            buttons: [{ title: "Voir"}]
        };
        
        if(chrome.notifications) {
            for(var i = 0; i < notifs.length; i++) {
                notifOptions.title = notifs[i].title;
                notifOptions.message = notifs[i].date;
                chrome.notifications.create(notifs[i].id, notifOptions, function() {});
            }
        }
    },
    
    openSdZ: function(url) {
        chrome.tabs.create({ 'url': this.url + url });
    }
};

var theNotificator = new Notificateur();