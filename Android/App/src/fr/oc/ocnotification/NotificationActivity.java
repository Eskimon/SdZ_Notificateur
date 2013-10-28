package fr.oc.ocnotification;

import android.os.Bundle;

import com.actionbarsherlock.app.SherlockFragmentActivity;

/**
 * @author AndroWiiid
 */
public class NotificationActivity extends SherlockFragmentActivity {

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_notification);
	}
}