package fr.oc.ocnotification.network;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;

public class SessionStore {
	private static final String USERNAME = "_username";
	private static final List<String> mKeysCookies = new ArrayList<String>();
	private static final String KEY = "session";

	public static boolean saveLogin(final String username, final Context context) {
		final Editor editor = context.getSharedPreferences(KEY,
				Context.MODE_PRIVATE).edit();
		editor.putString(USERNAME, username);
		return editor.commit();
	}

	public static String getLogin(final Context context) {
		final SharedPreferences savedSession = context.getSharedPreferences(
				KEY, Context.MODE_PRIVATE);
		return savedSession.getString(USERNAME, "");
	}

	public static boolean saveCookies(final Map<String, String> cookies,
			final Context context) {
		final Editor editor = context.getSharedPreferences(KEY,
				Context.MODE_PRIVATE).edit();
		for (Map.Entry<String, String> entry : cookies.entrySet()) {
			editor.putString(entry.getKey(), entry.getValue());
			mKeysCookies.add(entry.getKey());
		}
		return editor.commit();
	}

	public static Map<String, String> getCookies(final Context context) {
		final SharedPreferences savedSession = context.getSharedPreferences(
				KEY, Context.MODE_PRIVATE);
		final Map<String, String> res = new HashMap<String, String>();
		for (String key : mKeysCookies) {
			res.put(key, savedSession.getString(key, null));
		}
		return res;
	}
}
