package fr.oc.ocnotification;

import java.util.List;

import fr.oc.ocnotification.adapters.NotificationAdapter;
import fr.oc.ocnotification.models.Notification;
import fr.oc.ocnotification.network.NotificationManager;

import android.app.ListActivity;
import android.os.AsyncTask;
import android.os.Bundle;

public class OCNotificationActivity extends ListActivity {
	private final NotificationManager mNotificationManager = new NotificationManager();
	private NotificationAdapter mAdapterNotifications;
	
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
        
        // Initialize the list view component.
        mAdapterNotifications = new NotificationAdapter(this);
        getListView().setAdapter(mAdapterNotifications);
    }
    
    @Override
    public void onResume() {
    	super.onResume();
    	new NotificationAsyncTask().execute();
    }
    
    private class NotificationAsyncTask extends AsyncTask<Void, Void, List<Notification>> {
    	
		@Override
		protected List<Notification> doInBackground(Void... params) {
			return mNotificationManager.downloadNotifications();
		}
    	
		@Override
		protected void onPostExecute(List<Notification> result) {
			super.onPostExecute(result);
			mAdapterNotifications.addAll(result);
			mAdapterNotifications.notifyDataSetChanged();
		}
    }
}