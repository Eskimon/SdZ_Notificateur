var Notificateur = function() {
    this.init.apply(this, arguments);
};

Notificateur.prototype = {
    url: "http://www.siteduzero.com",
    
    roadmap: "http://www.siteduzero.com/p/roadmap-du-site-du-zero",
    
    logged: true, //savoir si le dernier statut est connecté ou déconnecté
        
    options: {
        updateInterval: 5,
		openListe: true,
        openInNewTab: true,
        showAllNotifButton: true,
        showDesktopNotif: true,
        useDetailedNotifs: false,
        lastEdit: "",
        notifPriority: 0,
        mpPriority: 0,
        playSon: false
    },
    
    storage: chrome.storage.sync,
    
    init: function() {
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
    			chrome.browserAction.setPopup({popup:"popup.html"});
    		}
    		
            chrome.alarms.create('refresh', {periodInMinutes: parseInt(this.options.updateInterval)});
            
            this.initListeners();
            
            this.loadSounds(function() {
                this.loadSoundpack(this.soundpack);
            }.bind(this));

            this.check();
            
            //this.checkRoadmap();
            
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
                if(tab.url.indexOf("/forum/sujet/") != -1 || tab.url.indexOf("/membres/") != -1) {//cas d'une notif de type badge ou forum -> il faut faire l'injection
                    if(this.alertTabId.indexOf(tabId) == -1) { //ne se déclenche pas si on arrive via une alerte de modo
                        chrome.tabs.executeScript(tabId, {
                            file: "injected.js"
                        });
                    } else {
                        this.alertTabId.splice(this.alertTabId.indexOf(tabId),1);
                    }
                    //on attend une seconde pour que le script soit injecté puis on check de nouveau les notifs pour mettre à jour le badge
                    setTimeout(this.check.bind(this),1000);
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
            var notif = this.getNotification(notifId);
            if(button == 0) { // Open last message
                if(notif) {
                    switch(notif.type) {
                        case("forum"): //normal
                            this.openSdZ("/forum/sujet/" + notif.thread + "/" + notif.messageId);
                            break;
                        case("badge"): //badge
                            this.openSdZ("/membres/" + notif.messageId);
                            break;
                        case("mp"): //MP
                            this.openSdZ("/mp/" + notif.thread + "/" + notif.messageId);
                            break;
                        case("roadmap"): //roadmap
                            this.openSdZ("/p/roadmap-du-site-du-zero");
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
                }
                
                chrome.notifications.clear(notifId, function() {
                    
                });
            }
        },
        
        notifClick: function(notifId) {
            var notif = this.getNotification(notifId);
            if(notif) {
                switch(notif.type) {
                    case("forum"): //normal
                        this.openSdZ("/forum/sujet/" + notif.thread + "/" + notif.messageId);
                        break;
                    case("badge"): //badge
                        this.openSdZ("/membres/" + notif.messageId);
                        break;
                    case("mp"): //MP
                        this.openSdZ("/mp/" + notif.thread + "/" + notif.messageId);
                        break;
                    case("roadmap"): //roadmap
                        this.openSdZ("/p/roadmap-du-site-du-zero");
                        break;
                    case("alerte"): //alerte
                        this.openSdZ("/forum/sujet/" + notif.thread + "/" + notif.messageId, true);
                        break;
                }
            }
            
            chrome.notifications.clear(notifId, function() {
                
            });
        },
        
        notifClose: function(notifId) {
            // A la fermeture de la notif
        }
    },
    
    check: function() {
        var self = this;
        chrome.browserAction.setIcon({"path":"icons/icone_38_parsing.png"});
        $.get(this.url, this.loadCallback.bind(this), "text").error(function() {
            //si jamais la requete plante (pas d'internet, 404 ou autre 500...)
            chrome.browserAction.setBadgeText({text: "err"});
            chrome.browserAction.setIcon({"path":"icons/icone_38_logout.png"});
            chrome.browserAction.disable();
            self.logged = false;
        });
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
data = this.fakeData;
        //ancienne solution car elle marche mieux oO
        var self = this,
            $data = $(data.replace(/<img[^>]*>/gi,"")),
            loginBox = $data.find("div#login");
            
                /*
                var self = this,
                xmlDoc = new DOMParser().parseFromString(data, "text/xml"), 
                $data = $(xmlDoc),
                loginBox = $($data).find("div#login");
                */
        
        //on est pas connecté !
        if(loginBox.length != 0) {
            if(this.logged) {
                chrome.browserAction.setBadgeText({text: ""});
                chrome.browserAction.setIcon({"path":"icons/icone_38_logout.png"});
                chrome.browserAction.disable();
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
                /* type de notif :
                                                   - forum
                                                   - badge
                                                   - MP
                                                   - roadmap
                                            */
            };

            var existingNotif = this.getNotification(notifObj.id);
            if(existingNotif) {
                $.extend(notifObj, existingNotif);
            }
            else {
                newNotifs.push(notifObj);
                this.newNotifCallback && this.newNotifCallback(notifObj);
            }
            
            if(this.options.useDetailedNotifs && !notifObj.detailed && (notifObj.type == "forum")) {
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

        
        // Check les mp
        notifications = $data.find("li#lastPrivateMessages a");
        newNotifs = []; // Liste des nouvelles notifications
        removedNotifs = []; // Notifs enlevées

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
                type: "mp" //si c'est un badge
                /* type de notif :
                                                   - forum
                                                   - badge
                                                   - MP
                                                   - roadmap
                                                   - alerte
                                            */
            };
            
            console.log(notifObj);

            var existingNotif = this.getNotification(notifObj.id);
            if(existingNotif) {
                $.extend(notifObj, existingNotif);
            }
            else {
                newNotifs.push(notifObj);
                this.newNotifCallback && this.newNotifCallback(notifObj);
            }
            
            if(!existingNotif)
                this.showDesktopNotif(notifObj);
                        
            notifsList.push(notifObj);
        }
        
        
        // Check les notifications "alertes" des modos
        notifications = $data.find("ul.alertsList li.notification");
        newNotifs = []; // Liste des nouvelles notifications
        removedNotifs = []; // Notifs enlevées
 
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
                type: "alerte" //si c'est un badge
                /* type de notif :
                                                   - forum
                                                   - badge
                                                   - MP
                                                   - roadmap
                                                   - alerte
                                            */
            };

            var existingNotif = this.getNotification(notifObj.id);
            if(existingNotif) {
                $.extend(notifObj, existingNotif);
            }
            else {
                newNotifs.push(notifObj);
                this.newNotifCallback && this.newNotifCallback(notifObj);
            }
            
            if(!existingNotif)
                this.showDesktopNotif(notifObj);
                        
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
        
        console.log("Update", {
            newNotifs: newNotifs,
            removedNotifs: removedNotifs,
            notifs: this.notifications
        });
        
        this.clearDesktopNotifs(removedNotifs);
        
        //set le texte du badge
        this.updateBadge();
        
        chrome.browserAction.setIcon({"path":"icons/icone_38.png"});
    },
    
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
    
    checkRoadmap: function() {
        var self = this;
        $.get(this.roadmap, function(data) {
            //on passe direct par jQuery car le parsage en XML bug
            var dateEdit = $(data).find("section#mainSection article h1 strong span").text();

            console.log(self.options.lastEdit);
            console.log(dateEdit);
            
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
    
    
    fakeData : '<ul class="nav nav-pills headerNotifications "> \
	<li class="dropdown all-camera-dropdown"> \
		<a id="notifications" class="dropdown-toggle fullOpacity" data-toggle="dropdown" data-target="#" href="/notifications"> \
			<span class="nbNotif">5</span> <div class="NotificationLink" style=""></div> \
		</a> \
		<a id="notificationsMob" class="fullOpacity" href="/notifications"> \
			<div><span class="nbNotif">5</span></div> \
		</a> \
		<a href="/notifications/lecture" class="read"></a> \
		<ul class="notificationList dropdown-menu"> \
			<li style="list-style: none;"> \
			<div id="lastNotifications"> \
				<div id="scrollMe"> \
						<ul class="list"> \
							<li class="notification "> \
								<a class="forumSdz link" href="/forum/sujet/session-jeux-d-ete-on-remet-ca/84550349"> \
									<ul class="content"> \
										<li class="title">Uzrok a répondu au sujet « Session jeux d\'été ? On...</li> \
										<li class="date">Il y a 7 minutes</li> \
									</ul> \
								</a> \
								<a class="delete" href="/notifications/archiver/988011" style=""><span>x</span></a> \
							</li> \
                            <li class="notification "> \
                                <a class="badgeSdz link" href="/membres/eskimon-32590#badges"> \
                                    <ul class="content"> \
                                        <li class="title">Vous avez gagné le badge Twitter Addict</li> \
                                        <li class="date">Il y a moins de 5s</li> \
                                    </ul> \
                                </a> \
                                <a class="delete" href="/notifications/archiver/1020034" style=""><span>x</span></a> \
                            </li> \
							<li class="notification "> \
								<a class="forumSdz link" href="/forum/sujet/jeu-forum-trouvez-l-insolite-dans-cette-photo/84550314"> \
									<ul class="content"> \
										<li class="title">Acrumus a répondu au sujet « [JEU Forum] Trouvez l...</li> \
										<li class="date">Il y a 18 minutes</li> \
									</ul> \
								</a> \
								<a class="delete" href="/notifications/archiver/987925" style=""><span>x</span></a> \
							</li> \
						</ul> \
					</div> \
					<ul class="list"> \
						<li class="notification seeall"> \
							<a href="/notifications" class="linkMP">Toutes mes notifications</a> \
						</li> \
					</ul>\
				</div>\
			</li>\
		</ul>\
	</li>\
</ul> \
<ul class="nav nav-pills headerAlerts"> \
    <li class="dropdown all-camera-dropdown"> \
        <a id="alerts" class="dropdown-toggle secondaryLink admin " data-toggle="dropdown" data-target="#" href="/alertes/"> \
            <span>1</span> <div class="alertsLink"></div> \
        </a> \
        <a id="alertsMob" class="" href="/alertes/"> \
            <div><span>1</span></div> \
        </a> \
        <ul class="alertsList  dropdown-menu"> \
            <li style="list-style: none;"> \
                <ul class="list" id="lastAlerts" style="width: 240px;"> \
                    <li class="notification read"> \
                        <a class="linkAlert" href="/forum/sujet/mon-image-de-fond-ne-s-affiche-pas-en-css/84572853"> \
                            <ul class="content"> \
                                <li class="title">Message de viki53</li> \
                                <li class="date">Il y a 5 minutes</li> \
                            </ul> \
                        </a> \
                    </li> \
                    <li class="notification read"> \
                        <a href="/alertes/" class="linkMP">Toutes les alertes</a> \
                    </li> \
                </ul> \
            </li> \
        </ul> \
    </li> \
</ul> \
'
};

var theNotificator = new Notificateur();
