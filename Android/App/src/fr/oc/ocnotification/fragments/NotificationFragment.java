package fr.oc.ocnotification.fragments;

import java.util.List;

import android.content.Intent;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;

import com.actionbarsherlock.app.SherlockListFragment;

import fr.oc.ocnotification.R;
import fr.oc.ocnotification.adapters.NotificationAdapter;
import fr.oc.ocnotification.models.Notification;
import fr.oc.ocnotification.network.NotificationManager;

public class NotificationFragment extends SherlockListFragment {
	private final NotificationManager mNotificationManager = new NotificationManager();
	private NotificationAdapter mAdapterNotifications;

	public static NotificationFragment newInstance() {
		return new NotificationFragment();
	}

	@Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container,
			Bundle savedInstanceState) {
		return inflater.inflate(R.layout.fragment_notification, container,
				false);
	}

	@Override
	public void onActivityCreated(Bundle savedInstanceState) {
		super.onActivityCreated(savedInstanceState);
		// Initialize components of the list.
		mAdapterNotifications = new NotificationAdapter(getActivity());
		getListView().setAdapter(mAdapterNotifications);
		// When we click on a item, we launch the browser.
		getListView().setOnItemClickListener(mOnItemClickListener);
	}

	@Override
	public void onResume() {
		super.onResume();
		// Launch the request.
		new NotificationAsyncTask().execute();
	}

	private final OnItemClickListener mOnItemClickListener = new OnItemClickListener() {

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
	};

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
					.downloadNotifications(getActivity());
		}

		@Override
		protected void onPostExecute(List<Notification> result) {
			super.onPostExecute(result);
			mAdapterNotifications.addAll(result);
			mAdapterNotifications.notifyDataSetChanged();
		}
	}
}
