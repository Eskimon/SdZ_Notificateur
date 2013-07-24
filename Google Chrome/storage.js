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
		return JSON.parse(localStorage['lastNotifs']);
	},
	
	saveLastNotifs : function(data) {
		localStorage['lastNotifs'] = JSON.stringify(data);
	},
	//------------------------------------------------------------------------------------
	isAllNotifsSet : function() {
		if (!localStorage['allNotifs']) { //l'interval de rafraichissement du widget n'existe pas
			localStorage['allNotifs'] = true;
		}
		return (JSON.parse(localStorage['allNotifs'].toLowerCase() == 'true'));
	},
	
	setAllNotifs : function(data) {
		localStorage['allNotifs'] = data.toString();
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
								<a class="forumSdz link" href="/forum/sujet/ateliers-pendant-l-ete/84550339"> \
									<ul class="content"> \
										<li class="title">pierre_24 a répondu au sujet « Ateliers pendant l\'...</li> \
										<li class="date">Il y a 10 minutes</li> \
									</ul> \
								</a> \
								<a class="delete" href="/notifications/archiver/987984" style=""><span>x</span></a> \
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
								<li class="notification "> \
									<a class="forumSdz link" href="/forum/sujet/fps-deepvoid-30781/84550287"> \
									<ul class="content"> \
										<li class="title">Ahy a répondu au sujet « [FPS] DeepVoid »</li> \
										<li class="date">Il y a 23 minutes</li> \
									</ul> \
								</a> \
								<a class="delete" href="/notifications/archiver/987856" style=""><span>x</span></a> \
							</li> \
							<li class="notification "> \
								<a class="forumSdz link" href="/forum/sujet/drone-raspberry/84550219"> \
									<ul class="content"> \
										<li class="title">Nathalya a répondu au sujet « Drone Raspberry ......</li> \
										<li class="date">Il y a 43 minutes</li> \
									</ul> \
								</a> \
								<a class="delete" href="/notifications/archiver/987747" style=""><span>x</span></a> \
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
</ul>'
};


