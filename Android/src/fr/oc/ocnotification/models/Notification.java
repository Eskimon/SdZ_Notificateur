package fr.oc.ocnotification.models;

public class Notification {
	private final int mId;
	private final String mTitle;
	private final String mDate;
	private final String mMessageId;
	private final String mThread;
	private final String mType;
	
	/*
 var notifObj = {
	id: archiveLink.substr(archiveLink.lastIndexOf("/") + 1),
	title: notif.find("li.title").text(),
	date: notif.find("li.date").text(),
	messageId: notifLink.substr(notifLink.lastIndexOf("/") + 1),
	thread: notifLink.substr(13, notifLink.lastIndexOf("/") - 13),
	type: notif.find("a.badgeSdz").text().length==0 ? "forum" : "badge" //si c'est un badge
};
	 */
	
	/**
	 * @param id
	 * @param title
	 * @param date
	 * @param messageId
	 * @param thread
	 * @param type
	 */
	public Notification(int id, String title, String date,
			String messageId, String thread, String type) {
		super();
		this.mId = id;
		this.mTitle = title;
		this.mDate = date;
		this.mMessageId = messageId;
		this.mThread = thread;
		this.mType = type;
	}

	/**
	 * @return the mId
	 */
	public int getId() {
		return mId;
	}

	/**
	 * @return the mTitle
	 */
	public String getTitle() {
		return mTitle;
	}

	/**
	 * @return the mDate
	 */
	public String getDate() {
		return mDate;
	}

	/**
	 * @return the mMessageId
	 */
	public String getMessageId() {
		return mMessageId;
	}

	/**
	 * @return the mThread
	 */
	public String getThread() {
		return mThread;
	}

	/**
	 * @return the mType
	 */
	public String getType() {
		return mType;
	}
}
