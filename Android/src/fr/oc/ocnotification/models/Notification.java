package fr.oc.ocnotification.models;

public class Notification {
	/** Id of the notification */
	private final int mId;
	/** Title of the notification */
	private final String mTitle;
	/** Date of the notification */
	private final String mDate;
	/** Message id of the notification */
	private final String mMessageId;
	/** Thread of the notification */
	private final String mThread;
	/** Type of the notification */
	private final String mType;
	
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
