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
		if (!localStorage['lastNotifs']) { //l'interval de rafraichissement du widget n'existe pas
			localStorage['lastNotifs'] = "";
		}
		return localStorage['lastNotifs'];
	},
	
	saveLastNotifs : function(texte) {
		localStorage['lastNotifs'] = texte;
	}
};

