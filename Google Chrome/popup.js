document.addEventListener('DOMContentLoaded', function () {
	var notifs = grenier.getLastNotifs();

	var len = notifs.length;
	var content = "";
	
	for(var i=0; i<len; i++) {
		content += '<a href="http://www.siteduzero.com' + notifs[i]["lien"] + '" data-archive="http://www.siteduzero.com'+ notifs[i]["archive"] + '"><div class="element">';
		content += '<p class="titre">';
		content += notifs[i]["titre"];
		content += "</p>";
		content += '<p class="temps">' + notifs[i]["temps"] + '</p>';
		content += "</div></a>";
		content += '<a class="test" href="http://www.siteduzero.com' + notifs[i]["archive"] + '"></a>';
		if(i<len-1)
			content += '<hr />';
	}
	
	if(grenier.isAllNotifsSet()) {
		content += '<hr />';
		content += '<a href="http://www.siteduzero.com/notifications">\
			<div class="allNotifs">Toutes mes notifications</div></a>';
	}
	
	document.getElementById('content').innerHTML = content;
	
	//enregistre les liens pour détecter les clicks et les renvoyer vers la page correspondante
	var liens = document.getElementsByTagName("a");
	var len = liens.length;
	for (var i=0; i < len; i++) {
    	liens[i].addEventListener("click", function (event) {
            event.preventDefault();
            //simule le clic sur bouton archiver des notifs SdZ
            
			//archiverNotif(this.getAttribute('data-archive'));
			//archiverNotif(this);
			
			//ouvre nouveau tab
			/*
			chrome.tabs.create({'url':this.href}, function(tab) {
				chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
				});
			})
			*/
			chrome.tabs.create({'url':this.href});
        }, false);
	}
	
});

//simule le click sur le bouton d'archivage sur le SdZ
function archiverNotif(lien) {
	/*
	var xhr = new XMLHttpRequest(); 
	xhr.open("GET",lien,true);
	xhr.send(null);
	*/
	/*
	$.ajax({
		'url': lien
	});
	*/
	/*
	$(lien).trigger('click');
	*/
var next = $(lien).next();
$(next).click();
	
	
}
