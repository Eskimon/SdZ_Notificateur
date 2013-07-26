var notificatorOptions = {
    init: function(_notificator) {
        this.notificator = _notificator;
        
        this.elems = {
            updateInterval: document.getElementById('interval'),
            openInNewTab: document.getElementById("newTab"),
            showAllNotifButton: document.getElementById("allNotifs"),
            showDesktopNotif: document.getElementById("notifNative")
        };
        
        document.getElementById("enregistrer").addEventListener("click", this.save.bind(this));
        
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
    },
    
    getValues: function() {
        var obj = {};
        for(var key in this.elems) {
            var val = this.elems[key].type == "checkbox" ? this.elems[key].checked : this.elems[key].value;
            obj[key] = val;
        }
        return obj;
    }
};

document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.getBackgroundPage(function(bgWindow) {
        var notificator = bgWindow.theNotificator;
        notificatorOptions.init.call(notificatorOptions, notificator);
    });
});