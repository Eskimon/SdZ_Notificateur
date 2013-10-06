package fr.oc.ocnotification.network;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import fr.oc.ocnotification.models.Notification;
import fr.oc.ocnotification.utils.Utils;

public class NotificationManager {
	private final static String URL = "http://fr.openclassrooms.com/";
	private final WebService mWebService = new WebService();

	public List<Notification> downloadNotifications() {
		final InputStream is = mWebService.connect(URL);
		final List<Notification> res = parse(is);
		return new ArrayList<Notification>();
	}

	private List<Notification> parse(InputStream is) {
		final String response = Utils.convertInputStreamToString(is);
		return null;
	}

}
