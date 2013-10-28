package fr.oc.ocnotification.models;

/**
 * @author AndroWiiid
 */
public class Notification {

	private final String url;
	private final String title;
	private final String date;

	/**
	 * @param url
	 * @param title
	 * @param date
	 */
	public Notification(String url, String title, String date) {
		super();
		this.url = url;
		this.title = title;
		this.date = date;
	}

	/**
	 * @return the url
	 */
	public String getUrl() {
		return url;
	}

	/**
	 * @return the title
	 */
	public String getTitle() {
		return title;
	}

	/**
	 * @return the date
	 */
	public String getDate() {
		return date;
	}
}
