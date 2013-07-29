var notificatorOptions = {
    init: function(_notificator) {
        this.notificator = _notificator;
        
        this.elems = {
            updateInterval: document.getElementById('interval'),
			openListe: document.getElementById('openListe'),
            openInNewTab: document.getElementById("newTab"),
            showAllNotifButton: document.getElementById("allNotifs"),
            showDesktopNotif: document.getElementById("notifNative"),
            useDetailedNotifs: document.getElementById("detailedNotifs")
        };
        
        document.getElementById("enregistrer").addEventListener("click", this.save.bind(this));
        this.elems["openListe"].addEventListener("click", this.toggle.bind(this));
        this.elems["showDesktopNotif"].addEventListener("click", this.toggle.bind(this));
        
        this.load();
    },
    
    save: function() {
        this.notificator.setOptions(this.getValues(), function() {
            console.log("Options Saved");
            window.close();
        });
    },
    
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
    },
    
    getValues: function() {
        var obj = {};
        for(var key in this.elems) {
            var val = this.elems[key].type == "checkbox" ? this.elems[key].checked : this.elems[key].value;
            obj[key] = val;
        }
        return obj;
    },
    
    toggle: function() {
        var etat = !this.elems['openListe'].checked;
        this.elems['openInNewTab'].disabled = etat;
        this.elems['showAllNotifButton'].disabled = etat;
        
        this.elems['useDetailedNotifs'].disabled = !this.elems['showDesktopNotif'].checked;
    }
};

document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.getBackgroundPage(function(bgWindow) {
        var notificator = bgWindow.theNotificator;
        notificatorOptions.init.call(notificatorOptions, notificator);
    });
});