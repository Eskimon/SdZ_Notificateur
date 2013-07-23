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
	}
};

