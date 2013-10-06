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

	public void disconnect() {
		if (mUrlConnection != null) {
			mUrlConnection.disconnect();
		}
	}

	public int getResponseCode() {
		return mResponseCode;
	}
}
