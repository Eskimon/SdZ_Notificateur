package fr.oc.ocnotification;

import android.content.Intent;
import android.os.Bundle;
import android.view.Window;

import com.actionbarsherlock.app.SherlockFragmentActivity;

import fr.oc.ocnotification.network.SessionStore;

/**
 * @author AndroWiiid
 */
public class LoginActivity extends SherlockFragmentActivity {
	@Override
	public void onCreate(Bundle arg0) {
		super.onCreate(arg0);
		if (!SessionStore.getCookies(this).isEmpty()) {
			startActivity(new Intent(this, NotificationActivity.class));
			finish();
		}
		requestWindowFeature(Window.FEATURE_INDETERMINATE_PROGRESS);
		setContentView(R.layout.activity_login);
	}
}
