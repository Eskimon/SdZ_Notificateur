package fr.oc.ocnotification;

import java.util.List;

import com.actionbarsherlock.app.SherlockListActivity;

import android.content.Intent;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import fr.oc.ocnotification.adapters.NotificationAdapter;
import fr.oc.ocnotification.models.Notification;
import fr.oc.ocnotification.network.NotificationManager;

/**
 * @author AndroWiiid
 */
public class OCNotificationActivity extends SherlockListActivity {
	private final NotificationManager mNotificationManager = new NotificationManager();
	private NotificationAdapter mAdapterNotifications;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);

		// Initialize components of the list.
		mAdapterNotifications = new NotificationAdapter(this);
		getListView().setAdapter(mAdapterNotifications);
		// When we click on a item, we launch the browser.
		getListView().setOnItemClickListener(new OnItemClickListener() {
			@Override
			public void onItemClick(AdapterView<?> adapter, View view, int pos,
					long arg3) {
				final Notification notification = mAdapterNotifications
						.getItem(pos);
				final Intent i = new Intent(Intent.ACTION_VIEW);
				i.setData(Uri.parse("http://fr.openclassrooms.com"
						+ notification.getUrl()));
				startActivity(i);
			}
		});
	}

	@Override
	public void onResume() {
		super.onResume();
		// Launch the request.
		new NotificationAsyncTask().execute();
	}

	/**
	 * Download all notifications like alerts, notifications and mp soon.
	 * 
	 * @author AndroWiiid
	 */
	private class NotificationAsyncTask extends
			AsyncTask<Void, Void, List<Notification>> {

		@Override
		protected List<Notification> doInBackground(Void... params) {
			return mNotificationManager
					.downloadNotifications(OCNotificationActivity.this);
		}

		@Override
		protected void onPostExecute(List<Notification> result) {
			super.onPostExecute(result);
			mAdapterNotifications.addAll(result);
			mAdapterNotifications.notifyDataSetChanged();
		}
	}
}