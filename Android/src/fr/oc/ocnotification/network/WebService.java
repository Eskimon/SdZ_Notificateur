package fr.oc.ocnotification.network;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;

import android.util.Log;

public class WebService {
	private static final String TAG = "eskimon.sdznotificateur";

	private HttpURLConnection mUrlConnection = null;
	private int mResponseCode = -1;

	/**
	 * Online request on an url.
	 * 
	 * @param strUrl
	 *            Url for request
	 * @return Result of the request
	 */
	public InputStream connect(String strUrl) {
		URLConnection connection = null;
		URL url = null;
		try {
			url = new URL(strUrl);
			connection = url.openConnection();
			mUrlConnection = (HttpURLConnection) connection;
			mUrlConnection.connect();
			mResponseCode = mUrlConnection.getResponseCode();
			if (mResponseCode == HttpURLConnection.HTTP_OK) {
				return mUrlConnection.getInputStream();
			}
		} catch (IOException e) {
			Log.w(TAG, "[IOException] e : " + e.getMessage());
		}
		return null;
	}

	/**
	 * Disconnect the connection of the online request.
	 */
	public void disconnect() {
		if (mUrlConnection != null) {
			mUrlConnection.disconnect();
		}
	}

	/**
	 * Get response of the current request.
	 * 
	 * @return response code
	 */
	public int getResponseCode() {
		return mResponseCode;
	}
}
