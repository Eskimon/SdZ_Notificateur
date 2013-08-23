﻿/**
 * Notificator Options
 * @namespace
 */

var NotificatorOptions = {
    /**
     * Init options
     */
    init: function(_notificator) {
        this.notificator = _notificator;
        
        this.elems = {
            updateInterval: document.getElementById('interval'),
            openListe: document.getElementById('openListe'),
            openInNewTab: document.getElementById("newTab"),
            showAllNotifButton: document.getElementById("allNotifs"),
            showDesktopNotif: document.getElementById("notifNative"),
            useDetailedNotifs: document.getElementById("detailedNotifs"),
            notifPriority: document.getElementById("priorityNotif"),
            mpPriority: document.getElementById("priorityMP"),
            playSon: document.getElementById("playSon"),
            tweet: document.getElementById("tweet"),
            SdZLink: document.getElementById("SdZLink"),
            autoclosePopup: document.getElementById("autoclosePopup")
        };
        
        document.getElementById("enregistrer").addEventListener("click", this.save.bind(this));
        this.elems["updateInterval"].addEventListener("keyup", this.checkInput.bind(this));
        this.elems["openListe"].addEventListener("click", this.toggle.bind(this));
        this.elems["showDesktopNotif"].addEventListener("click", this.toggle.bind(this));
        
        this.load();
    },
    
    oldValue: 5,
    
    /**
     * Check inputs
     * @param {Object} [evt] JS Event
     */
    checkInput: function(evt) {
        var val = this.elems["updateInterval"].value;
        if(val == '')
            this.elems["updateInterval"].value = this.oldValue;
        else {
            if(parseInt(val) > 60) {
                this.elems["updateInterval"].value = 60;
                this.oldValue = 60;
            } else {
                this.oldValue = val;
            }
        }
    },
    
    /**
     * Save options
     */
    save: function() {
        this.notificator.setOptions(this.getValues(), function() {
            console.log("Options Saved");
            window.close();
        });
    },
    
    /**
     * Load options
     */
    load: function() {
        this.options = this.notificator.getOptions();
        
        for(var key in this.elems) {
            if(this.options[key] !== undefined) {
                if(this.elems[key].type == "checkbox") {
                    this.elems[key].checked = this.options[key];
                }
                else {
                    this.elems[key].value = this.options[key];
                }
            }
        }
        this.toggle();
        this.oldValue = this.elems['updateInterval'].value;
        this.checkAvatar();
    },
    
    /**
     * Get inputs value
     * @returns {Object} The input values
     */
    getValues: function() {
        var obj = {};
        for(var key in this.elems) {
            var val = this.elems[key].type == "checkbox" ? this.elems[key].checked : parseInt(this.elems[key].value);
            obj[key] = val;
        }
        return obj;
    },
    
    /**
     * Toggle inputs
     */
    toggle: function() {
        if(this.elems['showDesktopNotif'].checked) {
            $(".subNotifFields").removeClass("disabled");
            $(".subNotifFields input").attr("disabled", false);
        }
        else {
            $(".subNotifFields").addClass("disabled");
            $(".subNotifFields input").attr("disabled", true);
        }
        
        if(this.elems['openListe'].checked) {
            $(".subPopupFields").removeClass("disabled");
            $(".subPopupFields input").attr("disabled", false);
        }
        else {
            $(".subPopupFields").addClass("disabled");
            $(".subPopupFields input").attr("disabled", true);
        }
        
        $(".priority input").on("change", function(e) {
            var value = "Erreur";
            switch(parseInt(e.target.value)) {
                case -2:
                    value = "Pas important";
                    break;
                case -1:
                    value = "Peu important";
                    break;
                case 0:
                    value = "Normale";
                    break;
                case 1:
                    value = "Important";
                    break;
                case 2:
                    value = "Très important";
                    break;
            }
            $(e.currentTarget).parent().find(".value").text(value);
        }).trigger("change");
    },
    
    /**
     * Check avatar
     */
    checkAvatar: function() {
        $.get("http://www.siteduzero.com", this.loadCallback.bind(this), "text");
    },
    
    /**
     * Callback when page loaded
     */
    loadCallback: function(data) {
        var self = this,
            xmlDoc = new DOMParser().parseFromString(data, "text/xml"), 
            $data = $(xmlDoc);

        var leDiv = $("div#connecteComme");
        
        //on est pas connecté !
        if(!this.notificator.logged) {
            leDiv.find("a").attr("href","http://www.siteduzero.com/login");
            leDiv.find("strong").text("Non connecté !");          
        } else {
            var avatarImgSrc = $data.find("img.memberAvatar").attr('src'),
            profil = $data.find("div#memberLinks a.nickname"),
            profilName = profil.text(),
            profilLink = profil.attr('href');
            
            leDiv.find("a").attr("href","http://www.siteduzero.com" + profilLink);
            leDiv.find("strong").text(profilName);
            leDiv.find("img").attr("src",avatarImgSrc);
        }
    }
};

document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.getBackgroundPage(function(bgWindow) {
        var notificator = bgWindow.theNotificator;
        NotificatorOptions.init.call(NotificatorOptions, notificator);
    });
});
