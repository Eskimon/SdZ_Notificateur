/**
 * SdZ Notificateur
 * @author Eskimon & Sandhose
 * @licence under MIT Licence
 * @version 0.1
 * ======
 * popup.js
 * Main script
 */

/**
 * Notificateur - Main class
 * @constructor
 */

var Notificateur = {
    /**
     * SdZ URL
     */
    url: "http://www.siteduzero.com",
    
    /**
     * Roadmap URL
     */
    roadmap: "http://www.siteduzero.com/p/roadmap-du-site-du-zero",
    
    /**
     * If logged in last check
     */
    logged: true,
    
    /**
     * Options
     */  
    options: {
        updateInterval: 5,
		openListe: true,
        openInNewTab: true,
        showAllNotifButton: true,
        showDesktopNotif: true,
        useDetailedNotifs: false,
        lastEdit: "Edit du 02/08/2013 à 15h48",
        notifPriority: 0,
        mpPriority: 0,
        playSon: false,
        SdZLink: false
    },
    
    _optionsTypes: { // Je l'ai quand meme fait ^
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
        SdZLink: Boolean
    },
    
    /**
     * Use fake data for debug
     */
    useFakeData: false,
    
    /**
     * Check en cours
     */
    checkPending: false,
    
    init: function() {
        console.log("ttessssstttttt");
        //window.setInterval(this.check.bind(this), 5000);
    },

    populate: function() {
        // Get the menupopup element that we will be working with
        var menu = document.getElementById("lemenu");
    
        // Remove all of the items currently in the popup menu
        for(var i=menu.childNodes.length - 1; i >= 0; i--)
        {
            menu.removeChild(menu.childNodes.item(i));
        }
    
        // Specify how many items we should add to the menu
        var numItemsToAdd = 10;
    
        for(var i=0; i<numItemsToAdd; i++)
        {
            // Create a new menu item to be added
            var tempItem = document.createElement("menuitem");
    
            // Set the new menu item's label
            tempItem.setAttribute("label", "Dynamic Item Number " + (i+1));
            //tempItem.setAttribute("oncommand", "objTutorialToolbar.SomeFunction()");
    
            // Add the item to our menu
            menu.appendChild(tempItem);
        }
    },
    
    /**
     * Check for new Notifications
     */
     
    check: function() {/*
        var self = this;
        if(this.checkPending) {
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
        });*/
        
        console.log("coucou");
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
        
        /*
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
        */
        
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
                /* //PAS PRES 
                this.fetchNotificationDetails(notifObj, function(newNotif) {
                    $.extend(notifObj, newNotif);
                    console.log("Detail fectched", newNotif);
                    self.showDesktopNotif(notifObj);
                });
                */
            }
            else if(!existingNotif) {
                //PAS PRES this.showDesktopNotif(notifObj);
            }
            
            notifsList.push(notifObj);
        }

        
        // Check les mp
        notifications = $data.find("li#lastPrivateMessages a");

        for(var i = 0; i < notifications.length-1; i++) { //-1 our pas avoir le lien "tout mes MP"
            var notif = $(notifications[i]),
                notifLink = notif.attr('href'),
                archiveLink = notifLink,
                texte = notif.text(); //pas de lien d'archives pour les alertes

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
            
            if(!existingNotif) {
                //PAS PRES this.showDesktopNotif(notifObj);
            }
                        
            notifsList.push(notifObj);
        }
        
        
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
            
            if(!existingNotif) {
                //PAS PRES this.showDesktopNotif(notifObj);
            }
                        
            notifsList.push(notifObj);
        }
        
        
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
        
        /* //PAS PRES 
        // Play sounds
        if(this.options.playSon) {
            this.playSound(hasNewNotif);
        }
        
        this.clearDesktopNotifs(removedNotifs);
        
        //set le texte du badge
        this.updateBadge();
        
        chrome.browserAction.setIcon({"path":"icons/icone_38.png"});
        */
        this.checkPending = false;
    },
};

window.addEventListener("DOMContentLoaded", Notificateur.init, false);
