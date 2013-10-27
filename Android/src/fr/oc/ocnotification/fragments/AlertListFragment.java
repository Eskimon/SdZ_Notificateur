package fr.oc.ocnotification.fragments;

import java.util.List;

import android.content.Intent;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.app.ListFragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import fr.oc.ocnotification.R;
import fr.oc.ocnotification.adapters.NotificationAdapter;
import fr.oc.ocnotification.models.Notification;
import fr.oc.ocnotification.network.NotificationManager;

public class AlertListFragment extends ListFragment implements OnItemClickListener {
	private static final String URL = "http://fr.openclassrooms.com";
	private final NotificationManager mNotificationManager = new NotificationManager();
	private NotificationAdapter mAdapterNotifications;

	@Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container,
			Bundle savedInstanceState) {
		return inflater.inflate(R.layout.fragment_list, container, false);
	}

	@Override
	public void onActivityCreated(Bundle savedInstanceState) {
		super.onActivityCreated(savedInstanceState);

		// Initialize components of the list.
		mAdapterNotifications = new NotificationAdapter(getActivity());
		getListView().setAdapter(mAdapterNotifications);
		// When we click on a item, we launch the browser.
		getListView().setOnItemClickListener(this);
	}

	@Override
	public void onResume() {
		super.onResume();
		// Launch the request.
		new NotificationAsyncTask().execute();
	}

	@Override
	public void onItemClick(AdapterView<?> adapter, View view, int pos,
			long arg3) {
		final Notification notification = mAdapterNotifications.getItem(pos);
		final Intent i = new Intent(Intent.ACTION_VIEW);
		i.setData(Uri.parse(URL + notification.getUrl()));
		startActivity(i);
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
			return mNotificationManager.downloadNotifications(getActivity());
		}

		@Override
		protected void onPostExecute(List<Notification> result) {
			super.onPostExecute(result);
			mAdapterNotifications.addAll(result);
			mAdapterNotifications.notifyDataSetChanged();
		}
	}
}
