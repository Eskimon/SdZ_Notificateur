package fr.oc.ocnotification.utils;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

import android.util.Log;

public class Utils {
	private static final String TAG = "eskimon.sdznotificateur";

	public static String convertInputStreamToString(InputStream is) {
		final StringBuilder sb = new StringBuilder();
		try {
			final InputStreamReader ins = new InputStreamReader(is, "UTF-8");			
			final BufferedReader reader = new BufferedReader(ins);
			String line = null;
			while ((line = reader.readLine()) != null) {
				sb.append(line + "\n");
			}
			is.close();
		} catch (Exception e) {
			Log.e(TAG, "Error converting result " + e.toString());
		}
		return sb.toString();
	}
}
