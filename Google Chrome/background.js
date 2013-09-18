/**
 * OpenClassrooms Notificateur
 * @author Eskimon & Sandhose
 * @licence under MIT Licence
 * @version 2.2.0
 * ======
 * background.js
 * Main background script
 */


/**
 * Notificateur - Main class
 * @constructor
 */
var Notificateur = function() {
    this.init.apply(this, arguments);
};

Notificateur.prototype = {
    /**
     * SdZ URL
     */
    url: "http://fr.openclassrooms.com",
    
    /**
     * Roadmap URL
     */
    roadmap: "http://fr.openclassrooms.com/p/roadmap",
    
    /**
     * If logged in last check
     */
    logged: true,
    
    /**
     * Options
     */  
    default_options: {
        updateInterval: 5,
        openListe: true,
        openInNewTab: true,
        showAllNotifButton: true,
        showDesktopNotif: true,
        useDetailedNotifs: false,
        lastEdit: "Edit du 23/08/2013 à 11h48",
        notifPriority: 0,
        mpPriority: 0,
        playSon: false,
        SdZLink: false,
        autoclosePopup: true,
        archiveAllLink: false
    },

    options: {},
    
    _optionsTypes: { // Je l'ai quand meme fait ^^
        updateInterval: Number,
        openListe: Boolean,
        openInNewTab: Boolean,
        showAllNotifButton: Boolean,
        showDesktopNotif: Boolean,
        useDetailedNotifs: Boolean,
        lastEdit: String,
        notifPriority: Number,
        mpPriority: Number,
        playSon: Boolean,
        SdZLink: Boolean,
        autoclosePopup: Boolean,
        archiveAllLink: Boolean
    },
    
    /**
     * Use fake data for debug
     */
    useFakeData: false,
    
    /**
     * Check en cours
     */
    checkPending: false,
    
    /**
     * chrome.storage
     */
    storage: chrome.storage.sync,
    
    /**
     * Init
     */
    init: function() {
        this.initialized = false;
        this.notifications = []; //tableau stockant les notifs
        this.alertTabId = [];
        this.MPs = []; //tableau stockant les MPs
        chrome.browserAction.enable(); //sinon un concours de circonstance pourrait nous faire démarrer avec une icone disable
        this.loadOptions(function() {
    		//action lorsqu'on click sur le bouton (affichage liste ou chargement SdZ
    		if(!this.options.openListe) { //soit on ouvre le SdZ
    			chrome.browserAction.setPopup({popup:""});
    			chrome.browserAction.onClicked.addListener(this.listeners.toolbarClick.bind(this));
    		} else { //sinon on ouvre une popup avec le contenu des notifs
    			chrome.browserAction.setPopup({popup:"popup/popup.html"});
    		}
    		
            chrome.alarms.create('refresh', {periodInMinutes: parseInt(this.options.updateInterval)});
            
            this.loadSounds(function() {
                this.loadSoundpack(this.soundpack);
            }.bind(this));
            
            this.initialized = true;
            
            this.check();
            this.checkRoadmap();
            
        }.bind(this));
        
        this.initListeners();
    },
    
    /* Add events listeners */
    initListeners: function() {
        chrome.runtime.onInstalled.addListener(this.listeners.install.bind(this));
        
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
    
    /**
     * Listeners 
     */
    listeners: {
        /**
         * Extension install
         */
        install: function(details) {
            if(details.reason == "install") {
                chrome.tabs.create({
                    'url': chrome.runtime.getURL("welcome/welcome.html"),
                    'active': true
                });
            }
        },
        
        /**
         * Tab Update
         */
        tabUpdate: function(tabId, changeInfo, tab) {
            if(tab.url !== undefined && tab.url.indexOf("openclassrooms.com") != -1 && tab.url.indexOf("openclassrooms.com") < 14 && changeInfo.status == "complete") {
                if(tab.url.indexOf("/forum/sujet/") != -1 || tab.url.indexOf("/membres/") != -1) {//cas d'une notif de type badge ou forum -> il faut faire l'injection
                    if(this.alertTabId.indexOf(tabId) == -1) { //ne se déclenche pas si on arrive via une alerte de modo
                        //on garde le inject juste pour le plaisir du konami code :D
                        chrome.tabs.executeScript(tabId, {
                            file: "injected.js"
                        });
                    } else {
                        this.alertTabId.splice(this.alertTabId.indexOf(tabId),1);
                    }
                    //on attend une seconde pour que le script soit injecté puis on check de nouveau les notifs pour mettre à jour le badge
                    this.check();
                } else if(tab.url.indexOf("/p/roadmap") != -1) {// cas de la roadmap
                    if(this.roadmapNotif) { //on supprime que si c'est nécessaire
                        delete this.notifications[this.getNotification("roadmap")];
                        delete this.roadmapNotif;
                    }
                    this.check();
                } else if(tab.url.indexOf("/mp/") != -1) { //cas des MP
                    this.check();
                }
            }
        },
        
        /**
         * Tab create
         */
        tabCreate: function(tab) {
            if(tab.url !== undefined && tab.url.indexOf("openclassrooms.com") != -1 && tab.url.indexOf("openclassrooms.com") < 14) {
                this.check();
            }
        },
        
        /**
         * Toolbar Click
         */
        toolbarClick: function() {
            chrome.tabs.create({
    				'url': this.url,
    				'active': true
    			});
        },
        
        /**
         * Alarm
         */
        alarm: function(alarm) {
            if (alarm.name == 'refresh') {
                this.check();
            }
        },
        
        /**
         * Notification button click
         */
        notifButtonClick: function(notifId, button) {
            var notif = this.getNotification(notifId);
            if(button == 0) { // Open last message
                if(notif) {
                    switch(notif.type) {
                        case("forum"): //normal
                            this.openSdZ("/forum/sujet/" + notif.thread + "/" + notif.messageId);
                            this.archiveNotification(notif.id);
                            break;
                        case("badge"): //badge
                            this.openSdZ("/membres/" + notif.messageId);
                            this.archiveNotification(notif.id);
                            break;
                        case("mp"): //MP
                            this.openSdZ("/mp/" + notif.thread + "/" + notif.messageId);
                            break;
                        case("roadmap"): //roadmap
                            this.openSdZ("/p/roadmap");
                            break;
                        case("alerte"): //alerte
                            this.openSdZ("/forum/sujet/" + notif.thread + "/" + notif.messageId, true);
                            break;
                    }
                }
                
                chrome.notifications.clear(notifId, function() {
                    
                });
            }
            else if(button == 1) { // Open thread
                if(notif) {
                    this.openSdZ("/forum/sujet/" + notif.thread);
                    this.archiveNotification(notif.id);
                }
                
                chrome.notifications.clear(notifId, function() {
                    
                });
            }
        },
        
        /**
         * Notif Click
         */
        notifClick: function(notifId) {
            var notif = this.getNotification(notifId);
            if(notif) {
                switch(notif.type) {
                    case("forum"): //normal
                        this.openSdZ("/forum/sujet/" + notif.thread + "/" + notif.messageId);
                        this.archiveNotification(notif.id);
                        break;
                    case("badge"): //badge
                        this.openSdZ("/membres/" + notif.messageId);
                        this.archiveNotification(notif.id);
                        break;
                    case("mp"): //MP
                        this.openSdZ("/mp/" + notif.thread + "/" + notif.messageId);
                        break;
                    case("roadmap"): //roadmap
                        this.openSdZ("/p/roadmap");
                        break;
                    case("alerte"): //alerte
                        this.openSdZ("/forum/sujet/" + notif.thread + "/" + notif.messageId, true);
                        break;
                }
            }
            
            chrome.notifications.clear(notifId, function() {
                
            });
        },
        
        /**
         * Notif close
         */
        notifClose: function(notifId) {
            // A la fermeture de la notif
        }
    },
    
    /**
     * Check for new Notifications
     */
    check: function() {
        var self = this;
        if(this.checkPending || !this.initialized) { // Si l'extension n'est pas (encore) initialisee ou un check est deja en cours
            return;
        }
        
        this.checkPending = true;
        chrome.browserAction.setIcon({"path":"icons/icone_38_parsing.png"});
        
        var url = this.useFakeData ? chrome.runtime.getURL("fake-data.xml") : this.url;
        $.get(url, this.loadCallback.bind(this), "text").error(function() {
            //si jamais la requete plante (pas d'internet, 404 ou autre 500...)
            chrome.browserAction.setBadgeText({text: "err"});
            chrome.browserAction.setIcon({"path":"icons/icone_38_logout.png"});
            chrome.browserAction.disable();
            self.logged = false;
            self.checkPending = false;
        });
    },
    
    /**
     * Get notifications by id 
     * @param {String} [id] Notification ID
     * @returns {Array|Object} A notifications if ID is set, or an array of all Notifications
     */
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
    
    /**
     * Callback on page load
     * @param {String} data Page data
     */
    loadCallback: function(data) {
        //data = this.fakeData; //pour DEBUG only
        //ancienne solution car elle marche mieux oO
        var self = this,
            $data = $(data.replace(/<img[^>]*>/gi,"")),
            loginBox = $data.find("div#login");
        
        var hasNewNotif = {
            notification: false,
            mp: false
        };
        
        //on est pas connecté !
        if(loginBox.length != 0 && !this.useFakeData) {
            if(this.logged) {
                chrome.browserAction.setBadgeText({text: "log"});
                chrome.browserAction.setIcon({"path":"icons/icone_38_logout.png"});
                //chrome.browserAction.disable();
                //chrome.alarms.clear('refresh');
                this.logged = false;
            }
            return;
        } else {
            if(!this.logged) {
                chrome.browserAction.enable();
                chrome.browserAction.setIcon({"path":"icons/icone_38.png"});
                //chrome.alarms.create('refresh', {periodInMinutes: parseInt(this.options.updateInterval)});
                //chrome.alarms.onAlarm.addListener(this.listeners.alarm.bind(this));
                this.logged = true;
            }
        }
        
        // Check les notifications
        var notifications = $data.find(".last-notification-item .dropdown-menu .dropdown-menu-item"),
            newNotifs = [], // Liste des nouvelles notifications
            oldNotifs = this.notifications, // Ancienne liste
            removedNotifs = [], // Notifs enlevées
            notifsList = []; // Nouvelle liste
            
        for(var i = 0; i < notifications.length; i++) {
            var notif = $(notifications[i]),
                notifLink = notif.find('a[class!="delete"]').attr('href'),
                archiveLink = notif.find("a.delete").attr('href');

            if(notifLink.indexOf("/notifications") != -1) continue; // Virer le "Toutes mes notifs"
            
            var notifObj = {
                id: archiveLink.substr(archiveLink.lastIndexOf("/") + 1),
                title: notif.find(".title").text(),
                date: notif.find(".date").text(),
                messageId: notifLink.substr(notifLink.lastIndexOf("/") + 1),
                thread: notifLink.substr(13, notifLink.lastIndexOf("/") - 13),
                type: notif.find("a.badgeSdz").text().length==0 ? "forum" : "badge" //si c'est un badge
            };

            var existingNotif = this.getNotification(notifObj.id);
            if(existingNotif) {
                $.extend(notifObj, existingNotif);
            }
            else {
                newNotifs.push(notifObj);
                this.newNotifCallback && this.newNotifCallback(notifObj);
                hasNewNotif.notification = true;
            }
            
            if(this.options.useDetailedNotifs && !notifObj.detailed && (notifObj.type == "forum")) {
                this.fetchNotificationDetails(notifObj, function(newNotif) {
                    var notifTmp = $.extend({}, notifObj, newNotif);
                    console.log("Detail fectched", notifTmp);
                    self.showDesktopNotif(notifTmp);
                });
            }
            else if(!existingNotif) {
                this.showDesktopNotif(notifObj);
            }
            
            notifsList.push(notifObj);
        }

        
        // Check les mp
        notifications = $data.find(".last-message-item .dropdown-menu .dropdown-menu-item");

        for(var i = 0; i < notifications.length-1; i++) { //-1 our pas avoir le lien "tout mes MP"
            var notif = $(notifications[i]),
                notifLink = notif.find('a[class!="delete"]').attr('href'),
                archiveLink = notifLink,
                texte = notif.text(); //pas de lien d'archives pour les alertes

            if(notifLink == "/mp/") continue;

            texte = texte.replace(/\s+/g," "); //vire les tabulations et autres cochonneries
            
            var debut = texte.indexOf("par"),
                fin = texte.indexOf("Il y a")-1;
                
            var notifObj = {
                id: "mp-"+notifLink.substr(notifLink.lastIndexOf("/") + 1),
                title: notif.find("strong").text() + " (" + texte.substr(debut, fin-debut) + ")",
                date: texte.substr(texte.indexOf("Il y a")),
                messageId: notifLink.substr(notifLink.lastIndexOf("/") + 1),
                thread: notifLink.substr(4, notifLink.lastIndexOf("/") - 4),
                type: "mp"
            };
            

            var existingNotif = this.getNotification(notifObj.id);
            if(existingNotif) {
                $.extend(notifObj, existingNotif);
            }
            else {
                newNotifs.push(notifObj);
                this.newNotifCallback && this.newNotifCallback(notifObj);
                hasNewNotif.mp = true;
            }
            
            if(!existingNotif)
                this.showDesktopNotif(notifObj);
                        
            notifsList.push(notifObj);
        }
        
        /*
        // Check les notifications "alertes" des modos
        notifications = $data.find("ul.alertsList li.notification");
 
        for(var i = 0; i < notifications.length-1; i++) { //-1 our pas avoir le lien "toutes les alertes"
            var notif = $(notifications[i]),
                notifLink = notif.find("a.linkAlert").attr('href'),
                archiveLink = notifLink; //pas de lien d'archives pour les alertes

            var notifObj = {
                id: "alerte-"+notifLink.substr(notifLink.lastIndexOf("/") + 1),
                title: notif.find("li.title").text(),
                date: notif.find("li.date").text(),
                messageId: notifLink.substr(notifLink.lastIndexOf("/") + 1),
                thread: notifLink.substr(13, notifLink.lastIndexOf("/") - 13),
                type: "alerte"
            };

            var existingNotif = this.getNotification(notifObj.id);
            if(existingNotif) {
                $.extend(notifObj, existingNotif);
            }
            else {
                newNotifs.push(notifObj);
                this.newNotifCallback && this.newNotifCallback(notifObj);
                hasNewNotif.notification = true;
            }
            
            if(!existingNotif)
                this.showDesktopNotif(notifObj);
                        
            notifsList.push(notifObj);
        }
        */
        
        this.notifications = notifsList;
        if(this.roadmapNotif)
            this.notifications.push(this.roadmapNotif);
        
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
        
        // Play sounds
        if(this.options.playSon) {
            this.playSound(hasNewNotif);
        }
        
        this.clearDesktopNotifs(removedNotifs);
        
        //set le texte du badge
        this.updateBadge();
        
        chrome.browserAction.setIcon({"path":"icons/icone_38.png"});
        
        this.checkPending = false;
    },
    
    /**
     * Show a desktop notification
     * @param {Objecy|Array} notif A Notification or an Array of Notifications
     */
    showDesktopNotif: function(notif) {
        if(typeof notif == "Array") {
            for(var i = 0; i < notif.length; i++) {
                this.showDesktopNotif(notif[i]);
            }
            return;
        }
        
        if(chrome.notifications && this.options.showDesktopNotif) {
            if(this.options.useDetailedNotifs && notif.detailed && (notif.type == "forum")) {
                var notifOptions = {};
                
                chrome.notifications.create(notif.id, {
                    type: "basic",
                    iconUrl: notif.avatarUrl,
                    title: notif.author + " - " + notif.threadTitle,
                    message: notif.postContent.replace(/<br \/>/ig, "\n").replace(/(<([^>]+)>)/ig, "").substr(0, 140) + "...\n" + notif.date,
                    priority: parseInt(this.options.notifPriority),
                    buttons: [{ title: "Voir le message" }, { title: "Voir le début du thread"}]
                }, function() {});
            }
            else {
                var boutons = new Array();
                var priority = 0;
                var icone = "";
                switch(notif.type) {
                    case("forum"):
                        boutons[0] = { title: "Voir le message" };
                        boutons[1] = { title: "Voir le début du thread" };
                        icone = "icons/big_message.png";
                        priority = this.options.notifPriority;
                        break;
                    case("badge"):
                        boutons[0] = { title: "Voir les badges" };
                        //récupère le nom du badge
                        var badgeTitle = notif.title.slice(notif.title.indexOf(" le badge ")+10);
                        badgeTitle = badgeTitle.replace(/\s/g, '_');
                        if(this.badgeLink.hasOwnProperty(badgeTitle)) //si on a ce badge en stock
                            icone = this.url + this.badgeLink[badgeTitle];
                        else
                            icone = "icons/big_badge.png";
                        priority = this.options.notifPriority;
                        break;
                    case("mp"):
                        boutons[0] = { title: "Voir le MP" };
                        icone = "icons/big_mp.png";
                        priority = this.options.mpPriority;
                        break;
                    case("roadmap"):
                        boutons[0] = { title: "Voir la roadmap" };
                        icone = "icons/big_roadmap.png";
                        priority = this.options.notifPriority;
                        break;
                    case("alerte"):
                        boutons[0] = { title: "Voir l'alerte" };
                        icone = "icons/big_alerte.png";
                        priority = this.options.notifPriority;
                        break;
                }
                var notifOptions = { // Options des notifications
                    type: "basic",
                    iconUrl: icone,
                    title: notif.title,
                    message: notif.date,
                    buttons: boutons,
                    priority: parseInt(priority)
                };
                
                chrome.notifications.create(notif.id, notifOptions, function() {});
            }
        }
    },
    
    /**
     * Archive notification via XMLHttpRequest
     * @param {Array|Object|String} notifs ID de la notif ou Notif ou array de notifs
     */
    archiveNotification: function(_notif) {
        if(Object.prototype.toString.call(_notif) == "[object Array]") {
            for(var i = 0; i < _notif.length; i++) {
                this.archiveNotification(_notif[i]);
            }
            
            return;
        }
        var notif;
        if(typeof _notif == "object") {
            notif = _notif;
        }
        else {
            notif = this.getNotification(_notif);
        }

        if(notif.id !== undefined && (notif.type == "forum" || notif.type == "badge")) {
            $.ajax({
                url: this.url + "/notifications/archiver/" + notif.id, 
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                success: function(data) {
                    if(data == "ok") {
                        console.log("Notification", notif.id, "archived", data);
                        this.removeNotification(notif.id);
                    }
                    else {
                        console.error("Failed to archive notification", notif.id);
                    }
                }.bind(this)
            });
        }
    },

    /**
     * Archive all notifications
     * @param {Function} callback
     */
    archiveAll: function(callback) {
        $.get(this.url + "/notifications", function() {
            var toRemove = [];
            for(var i in this.notifications) {
                if(this.notifications[i].type == "forum" || this.notifications[i].type == "badge") {
                    toRemove.push(this.notifications[i].id);
                }
            }
            this.removeNotification(toRemove);
            console.log(toRemove);
            callback && callback();
        }.bind(this));
    },
    
    /**
     * Remove notification(s)
     * @param {Array|Object|String} notifs ID de la notif ou notif ou array de notifs
     */
    removeNotification: function(_notif) {
        if(Object.prototype.toString.call(_notif) == "[object Array]") {
            for(var i = 0; i < _notif.length; i++) {
                this.removeNotification(_notif[i]);
            }
            
            return;
        }
        var id;
        if(typeof _notif == "object") {
            id = _notif.id;
        }
        else {
            id = _notif;
        }
        for(var i = 0; i < this.notifications.length; i++) {
            if(this.notifications[i].id == id) {
                this.removeNotifCallback && this.removeNotifCallback(this.notifications[i]);
                this.notifications.splice(i, 1);
                this.updateBadge();
            }
        }
    },
    
    /**
     * Clear desktops notifications
     * @param {Array} notifs Array of notifications to clear
     */
    clearDesktopNotifs: function(notifs) {
        if(chrome.notifications) {
            for(var i = 0; i < notifs.length; i++) {
                chrome.notifications.clear(notifs[i].id, function() {});
            }
        }
    },
    
    /**
     * Fetch notifications details (forum posts only)
     * @param {Object|Array} notif A notifications or an Array of notifications
     * @param {Function} callback The callback when the details are fetched
     */
    fetchNotificationDetails: function(notif, callback) {
        if(Object.prototype.toString.call(notif) == "[object Array]") {
            for(var i = 0; i < notif.length; i++) {
                this.fetchNotificationDetails(notif[i], function(newNotif) {
                    callback && callback(newNotif, i);
                });
            }
            
            return;
        }
        
        $.get(this.url + "/forum/sujet/" + notif.thread + "/" + notif.messageId, function(_data) {
            var data = _data.replace(/src=/ig, "data-src=").replace(/href=/ig, "data-href="); // <-- pas forcement la meilleur methode... marche pas si qqn a un nom/avatar avec src=/href= dans le nom
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
    
    /**
     * Get options
     * @param {String} [key] Option key
     * @returns {Object} The options value or all options
     */
    getOptions: function(key) {
        if(key) {
            return this.options[key];
        }
        else {
            return this.options;
        }
    },
    
    /**
     * Set options
     * @param {Object} changes Object of options changes
     * @param {Function} [callback]
     */
    setOptions: function(changes, callback) {
        callback = callback || function() { console.log("Options saved"); };
        
        var oldOptions = this.options;
        for(var key in changes) {
            if(this.options.hasOwnProperty(key)) {
                // Conversion des donnees dans le bon type
                if(this._optionsTypes[key] == Number) {
                    changes[key] = parseInt(changes[key]);
                }
                else if(this._optionsTypes[key] == Boolean) {
                    changes[key] = !!changes[key];
                }
                else if(this._optionsTypes[key] == String) {
                    changes[key] = changes[key].toString();
                }
                
                this.options[key] = changes[key];
            }
        }
        
        changes.timestamp = Date.now();
        
        console.log("Options changes from", oldOptions, "to", this.options);
        this.storage.set(changes, callback);
        this.updateOptions();
    },

    /**
     * Reset options
     */
    resetOptions: function() {
        var defaults = this.default_options;
        delete defaults["lastEdit"];
        this.setOptions(defaults);
    },
    
    /**
     * Load options from chrome.storage
     * @param {Function} [callback] Callback when options are loaded
     */
    loadOptions: function(callback) { // Charge les options depuis le chrome.storage
        this.options = $.extend(this.options, this.default_options);
        var keys = Object.keys(this.options);
        this.storage.get(keys, function(items) {
            for(var key in items) {
                if(this.options.hasOwnProperty(key)) {
                    this.options[key] = items[key];
                }
            }
            
            (typeof callback == "function") && callback();
        }.bind(this));
    },
    
    /**
     * Update options
     */
    updateOptions: function() {
        // Update interval
        chrome.alarms.create('refresh', { periodInMinutes: parseInt(this.options.updateInterval) });
		
		//action lorsqu'on click sur le bouton (affichage liste ou chargement SdZ
		if(!this.options.openListe) { //soit on ouvre le SdZ
			chrome.browserAction.setPopup({popup:""});
			chrome.browserAction.onClicked.addListener(this.listeners.toolbarClick.bind(this));
		} else { //sinon on ouvre une popup avec le contenu des notifs
			chrome.browserAction.onClicked.removeListener(this.listeners.toolbarClick);
			chrome.browserAction.setPopup({popup:"popup/popup.html"});
		}
    },
    
    /**
     * Load soundpacks
     * @param {Function} [callback] Callback fired when soundpacks are loaded
     */
    loadSounds: function(callback) {
        $.getJSON(chrome.extension.getURL("/sounds/packs.json"), function(data) {
            this.soundpacks = data;
            if(this.soundpacks.sounds[this.options.soundpack]) {
                this.soundpack = this.soundpacks.sounds[this.options.soundpack];
            }
            else {
                this.soundpack = this.soundpacks.sounds[this.soundpacks.default_soundpack];
            }
            
            callback && callback();
        }.bind(this));
    },
    
    /**
     * Load a specific soundpack
     * @param {Object} soundpack The soundpack to load
     */
    loadSoundpack: function(soundpack) {
        var soundsList = document.getElementById("sound_list") || document.createElement("div");
        soundsList.id = "sound_list";
        document.body.appendChild(soundsList);
        soundsList.innerHTML = "";
        
        ["notif_mp_new", "notif_new", "mp_new"].forEach(function(element) {
            //debugger;
            var exists = document.getElementById("audio_" + element) !== null,
                sound = exists ? document.getElementById("audio_" + element) : new Audio();
            sound.src = chrome.extension.getURL("/sounds/" + soundpack.folder + "/" + soundpack.sounds[element]);
            sound.id = "audio_" + element;
            sound.autoplay = false;
            sound.load();
            !exists && soundsList.appendChild(sound);
        }, this);
    },
    
    /**
     * Play sound
     * @param {Object} options Which sound should be played?
     */
    playSound: function(options) {
        var sound;
        if(options.notification && options.mp) {
            sound = document.getElementById("audio_notif_mp_new");
        }
        else if(options.notification) {
            sound = document.getElementById("audio_notif_new");
        }
        else if(options.mp) {
            sound = document.getElementById("audio_mp_new");
        }
        else {
            return;
        }
        
        if(sound) {
            sound.pause();
            sound.currentTime = 0;
            sound.play();
        }
    },
    
    /**
     * Set new notif callback
     * @param {Function} callback
     */
    setNewNotifCallback: function(callback) {
        if(typeof callback == "function") {
            this.newNotifCallback = callback;
        }
        else {
            this.newNotifCallback = undefined;
        }
    },
    
    /**
     * Set remove notif callback
     * @param {Function} callback
     */
    setRemoveNotifCallback: function(callback) {
        if(typeof callback == "function") {
            this.removeNotifCallback = callback;
        }
        else {
            this.removeNotifCallback = undefined;
        }
    },
    
    /**
     * Open a SdZ page
     * @param {String} _url The url to open
     * @param {Boolean} remember
     */
    openSdZ: function(_url, remember) {
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
                if(remember) {
                    self.alertTabId.push(tab.id); //on ajout l'id du tab
                }
                chrome.tabs.update(tab.id, { url: url });
            }
            else {
                chrome.tabs.create({
                    'url': url,
                    'active': false
                }, function(tab){
                    if(remember) {
                        self.alertTabId.push(tab.id); //on ajout l'id du tab
                    }
                });
            }
        });
    },
    
    /**
     * Check the Roadmap
     */
    checkRoadmap: function() {
        if(!this.initialized) return; // Si l'extension n'est pas (encore) initialisee
        var self = this;
        $.get(this.roadmap, function(data) {
            //on passe direct par jQuery car le parsage en XML bug
            var dateEdit = $(data).find("section#mainSection article h1 strong span").text();
            
            if(dateEdit != self.options.lastEdit) { //si il y a du nouveau, alors on agit !
                //on fait une notif de plus
                var notifObj = {
                    id: "roadmap",
                    title: "Mise à jour de la roadmap paru",
                    date: dateEdit,
                    messageId: "",
                    thread: "",
                    type: "roadmap" //type roadmap
                };
                
                self.newNotifCallback && self.newNotifCallback(notifObj);
                self.roadmapNotif = notifObj; //sera ajouter à la liste des notifications
                self.notifications.push(self.roadmapNotif);
                self.updateBadge(); //met à jour le badge
                self.showDesktopNotif(notifObj); //on montre la notif de bureau
                //mise à jour du storage pour cette info (pas encore actif pour moins d'emmerdes lors des tests)
                self.options.lastEdit = dateEdit;
                self.setOptions(self.options);
            }
        });
    },
    
    /**
     * Update badge
     */
    updateBadge: function() {
        var notifs = this.notifications,
            len = notifs.length,
            totMP = 0;
        for(var i=0; i<len; i++)
            if(notifs[i].type == "mp")
                totMP++;
                
        var badgeTexte = (totMP > 0) ? totMP.toString() + " - " : "";
        badgeTexte += (len-totMP > 0) ? (len-totMP).toString() : ((totMP > 0) ? "0" : "");
        chrome.browserAction.setBadgeText({text: badgeTexte});
    },
    
    badgeLink : {
        Instituteur:"/bundles/common/images/badge/instituteur.png",
        Aventurier:"/bundles/common/images/badge/aventurier.png",
        Twitter_Addict:"/bundles/common/images/badge/twitter.png",
        Urgentiste:"/bundles/common/images/badge/urgentiste.png",
        Jet_set:"/bundles/common/images/badge/jet_set.png",
        Birthday:"/bundles/common/images/badge/birthday.png",
        The_place_to_be:"/bundles/common/images/badge/the_place_to_be.png",
        Secouriste:"/bundles/common/images/badge/secouriste.png",
        Sauveur:"/bundles/common/images/badge/sauveur.png",
        Beau_parleur:"/bundles/common/images/badge/beau_parleur.png",
        Bavard:"/bundles/common/images/badge/bavard.png",
        Premiers_secours:"/bundles/common/images/badge/premiers_secours.png",
        Timide:"/bundles/common/images/badge/timide.png",
        Extraverti:"/bundles/common/images/badge/extraverti.png",
        Écolier:"/bundles/common/images/badge/ecolier.png",
        Frimeur:"/bundles/common/images/badge/frimeur.png",
        Premiers_mots:"/bundles/common/images/badge/premiers_mots.png",
        Teenager:"/bundles/common/images/badge/teenager.png",
        Baby_Zéro:"/bundles/common/images/badge/baby_zero.png",
        Vieux_de_la_vieille:"/bundles/common/images/badge/vieux_de_la_vieille.png",
        Vétéran:"/bundles/common/images/badge/veteran.png",
        Challenger:"/bundles/common/images/badge/challenger.png",
        Expert:"/bundles/common/images/badge/expert.png",
        Groupie:"/bundles/common/images/badge/groupie.png",
        La_science_infuse:"/bundles/common/images/badge/la_science_infuse.png",
        Professeur:"/bundles/common/images/badge/professeur.png",
        Scribe:"/bundles/common/images/badge/scribe.png",
        Scribe_du_futur:"/bundles/common/images/badge/scribe_du_futur.png",
        Adulte:"/bundles/common/images/badge/adulte.png",
        Ange_Gardien:"/bundles/common/images/badge/ange_gardien.png",
        Baratineur:"/bundles/common/images/badge/baratineur.png",
        Bienfaiteur:"/bundles/common/images/badge/bienfaiteur.png",
        Bosseur:"/bundles/common/images/badge/bosseur.png",
        Commère:"/bundles/common/images/badge/commere.png",
        Dictionnaire_ambulant:"/bundles/common/images/badge/dictionnaire_ambulant.png",
        Fossile:"/bundles/common/images/badge/fossile.png",
        Moulin_à_Paroles:"/bundles/common/images/badge/moulin_a_paroles.png",
        Pipelette:"/bundles/common/images/badge/pipelette.png",
        Superhéros:"/bundles/common/images/badge/superhero.png",
        Facebook_Addict:"/bundles/common/images/badge/facebook.png",
        Abonné:"/bundles/common/images/badge/abonnement.png"
    }
};


/** @global */
window.theNotificator = new Notificateur();
