package fr.oc.ocnotification;

import android.os.Bundle;
import android.view.Window;

import com.actionbarsherlock.app.SherlockFragmentActivity;

/**
 * @author AndroWiiid
 */
public class LoginActivity extends SherlockFragmentActivity {
	@Override
	public void onCreate(Bundle arg0) {
		super.onCreate(arg0);
		requestWindowFeature(Window.FEATURE_INDETERMINATE_PROGRESS);
		setContentView(R.layout.activity_login);
	}
}
