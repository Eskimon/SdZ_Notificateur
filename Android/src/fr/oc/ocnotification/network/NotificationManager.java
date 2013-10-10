package fr.oc.ocnotification.network;

import java.util.ArrayList;
import java.util.List;

import fr.oc.ocnotification.models.Notification;

// TODO Must implement this method.
public class NotificationManager {
	// private final static String URL = "http://fr.openclassrooms.com/";
	// private final WebService mWebService = new WebService();

	public List<Notification> downloadNotifications() {
		// final InputStream is = mWebService.connect(URL);
		// final List<Notification> res = parse(is);
		
		// Impossible de recuperer les notifications. Utilisateur non connecte
		// d'office.
		return new ArrayList<Notification>();
	}

}
