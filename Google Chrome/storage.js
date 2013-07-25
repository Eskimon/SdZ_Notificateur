//fichier pour gérer la persistence (les options etc...)

var grenier = {
	getRefreshInterval : function() {
		if (!localStorage['refreshInterval']) { //l'interval de rafraichissement du widget n'existe pas
			localStorage['refreshInterval'] = 5;
		}
		return parseInt(localStorage['refreshInterval']);
	},
	
	setRefreshInterval : function(interval) {
		localStorage['refreshInterval'] = interval;
	},
	//------------------------------------------------------------------------------------
	getComportement : function() {
		if (!localStorage['newTab']) { //l'interval de rafraichissement du widget n'existe pas
			localStorage['newTab'] = false;
		}
		return (localStorage['newTab'].toLowerCase() == 'true');
	},
	
	setComportement : function(newTab) {
		localStorage['newTab'] = newTab.toString();
	},
	//------------------------------------------------------------------------------------
	getLastNotifs : function() {
	    var outObj = [];
		if (!localStorage['lastNotifs']) { //l'interval de rafraichissement du widget n'existe pas
			localStorage['lastNotifs'] = "";
		}
		
		try { // Histoire de pas planter quand les données sont mal formées
    		var outObj = JSON.parse(localStorage['lastNotifs']);
		}
		catch(e) {
    		outObj = [];
    		localStorage['lastNotifs'] = "";
		}
		return outObj;
	},
	
	saveLastNotifs : function(data) {
		localStorage['lastNotifs'] = JSON.stringify(data);
	},
	//------------------------------------------------------------------------------------
	isAllNotifsSet : function() {
		if (!localStorage['allNotifs']) { //l'interval de rafraichissement du widget n'existe pas
			localStorage['allNotifs'] = true;
		}
		return (localStorage['allNotifs'].toLowerCase() == 'true');
	},
	
	setAllNotifs : function(data) {
		localStorage['allNotifs'] = data.toString();
	},
	//------------------------------------------------------------------------------------
	isNotifNativeSet : function() {
		if (!localStorage['notifNative']) { //l'interval de rafraichissement du widget n'existe pas
			localStorage['notifNative'] = true;
		}
		return (localStorage['notifNative'].toLowerCase() == 'true');
	},
	
	setNotifNative : function(data) {
		localStorage['notifNative'] = data.toString();
	}
};


