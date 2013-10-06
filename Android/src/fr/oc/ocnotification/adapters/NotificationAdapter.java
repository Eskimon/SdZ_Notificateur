package fr.oc.ocnotification.adapters;

import java.util.ArrayList;
import java.util.List;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.LinearLayout;
import android.widget.TextView;
import fr.oc.ocnotification.R;
import fr.oc.ocnotification.models.Notification;

public class NotificationAdapter extends BaseAdapter {
	private final Context mContext;
	private final List<Notification> mListNotifications = new ArrayList<Notification>();

	public NotificationAdapter(Context context) {
		mContext = context;
	}

	@Override
	public int getCount() {
		return this.mListNotifications.size();
	}

	@Override
	public Notification getItem(int pos) {
		return this.mListNotifications.get(pos);
	}

	@Override
	public long getItemId(int pos) {
		return pos;
	}

	@Override
	public View getView(int position, View convertView, ViewGroup parent) {
		final Notification item = getItem(position);
		NotificationView view = null;
		if (convertView == null) {
			view = new NotificationView(mContext);
		} else {
			view = (NotificationView) convertView;
		}
		view.bind(item.getTitle(), item.getDate());
		return view;
	}

	public boolean addAll(List<Notification> notifications) {
		if (notifications == null || notifications.size() == 0) {
			return false;
		}
		mListNotifications.clear();
		return mListNotifications.addAll(notifications);
	}
	
	private class NotificationView extends LinearLayout {
		private final TextView mTextViewTitle;
		private final TextView mTextViewDate;
		
		public NotificationView(Context context) {
			super(context);
			inflate(getContext(), R.layout.notification_view, this);
			mTextViewTitle = (TextView) findViewById(R.id.textViewTitle);
			mTextViewDate = (TextView) findViewById(R.id.textViewDate);
		}

		public void bind(final String title, final String date) {
			mTextViewTitle.setText(title);
			mTextViewDate.setText(date);
		}
	}
}
