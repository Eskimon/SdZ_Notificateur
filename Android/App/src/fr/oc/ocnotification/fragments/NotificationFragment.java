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
import fr.oc.ocnotification.adapters.NotificationPagerAdapter;
import fr.oc.ocnotification.models.Notification;
import fr.oc.ocnotification.network.NotificationManager;

public class NotificationFragment extends SherlockListFragment {
	public final static String URL = "http://fr.openclassrooms.com";
	private final static String KEY_POS = "KEY_POS";
	private final NotificationManager mNotificationManager = new NotificationManager();
	private NotificationAdapter mAdapterNotifications;
	private int mPos = 0;

	public static NotificationFragment newInstance(final int pos) {
		NotificationFragment fragment = new NotificationFragment();
		Bundle args = new Bundle();
		args.putInt(KEY_POS, pos);
		fragment.setArguments(args);
		return fragment;
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
		// Arguments.
		mPos = getArguments().getInt(KEY_POS);
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
		new NotificationAsyncTask().execute(mPos);
	}

	private final OnItemClickListener mOnItemClickListener = new OnItemClickListener() {

		@Override
		public void onItemClick(AdapterView<?> adapter, View view, int pos,
				long arg3) {
			final Notification notification = mAdapterNotifications
					.getItem(pos);
			final Intent i = new Intent(Intent.ACTION_VIEW);
			i.setData(Uri.parse(URL + notification.getUrl()));
			startActivity(i);
		}
	};

	/**
	 * Download all notifications like alerts, notifications and mp soon.
	 * 
	 * @author AndroWiiid
	 */
	private class NotificationAsyncTask extends
			AsyncTask<Integer, Void, List<Notification>> {

		@Override
		protected List<Notification> doInBackground(Integer... params) {
			final int pos = params[0];
			switch (pos) {
			case NotificationPagerAdapter.NOTIFICATIONS:
				return mNotificationManager
						.downloadNotifications(getActivity());
			case NotificationPagerAdapter.PMS:
				return mNotificationManager.downloadPMs(getActivity());
			case NotificationPagerAdapter.ALERTS:
				return mNotificationManager.downloadAlerts(getActivity());
			}
			return null;
		}

		@Override
		protected void onPostExecute(List<Notification> result) {
			super.onPostExecute(result);
			if (result == null || result.isEmpty()) {
				return;
			}
			mAdapterNotifications.addAll(result);
			mAdapterNotifications.notifyDataSetChanged();
		}
	}
}
