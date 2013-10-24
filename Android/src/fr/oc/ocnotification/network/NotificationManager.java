package fr.oc.ocnotification.network;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import android.content.Context;
import fr.oc.ocnotification.models.Notification;

public class NotificationManager {
	private final static String URL = "http://fr.openclassrooms.com/";

	/**
	 * Download all notification on OpenClassrooms website.
	 * 
	 * @param context
	 *            Context of the application.
	 * @return List of notifications.
	 */
	public List<Notification> downloadNotifications(final Context context) {
		final List<Notification> res = new ArrayList<Notification>();
		Document doc = null;
		try {
			doc = Jsoup.connect(URL).cookies(SessionStore.getCookies(context))
					.get();
		} catch (IOException e) {
			e.printStackTrace();
		}
		// All notifications.
		final Elements notifications = doc
				.select("li.menu-nav-item.last-notification-item li.dropdown-menu-item");
		for (int i = 0; i < notifications.size() - 1; i++) {
			Element notification = notifications.get(i);
			final String url = notification.getElementsByTag("a").first()
					.attr("href");
			final String title = notification.getElementsByTag("strong")
					.first().text();
			final String date = notification.getElementsByTag("span").first()
					.text();
			final Notification alert = new Notification(url, title, date);
			res.add(alert);
		}
		// All alerts.
		final Elements alerts = doc
				.select("li.menu-nav-item.last-active-item li.dropdown-menu-item");
		for (int i = 0; i < alerts.size() - 1; i++) {
			Element alert = alerts.get(i);
			final String url = alert.getElementsByTag("a").first().attr("href");
			final String title = alert.getElementsByTag("strong").first()
					.text();
			final String date = alert.getElementsByTag("span").first().text();
			res.add(new Notification(url, title, date));
		}
		return res == null ? new ArrayList<Notification>() : res;
	}
}
