package fr.oc.ocnotification.adapters;

import java.util.ArrayList;
import java.util.List;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.LinearLayout;
import android.widget.TextView;
import fr.oc.ocnotification.R;
import fr.oc.ocnotification.models.Notification;

public class NotificationAdapter extends BaseAdapter {
	// private final Context mContext;
	private final List<Notification> mListNotifications = new ArrayList<Notification>();
	private final LayoutInflater mInflater;

	public NotificationAdapter(Context context) {
		// mContext = context;
		mInflater = LayoutInflater.from(context);
	}
	
	@Override
	public int getCount() {
		return this.mListNotifications.size();
	}

	@Override
	public Object getItem(int pos) {
		return this.mListNotifications.get(pos);
	}

	@Override
	public long getItemId(int pos) {
		return pos;
	}

	@Override
	public View getView(int position, View convertView, ViewGroup parent) {
		LinearLayout layoutItem;
		//(1) : Réutilisation des layouts
		if (convertView == null) {
			//Initialisation de notre item à partir du  layout XML "personne_layout.xml"
		  layoutItem = (LinearLayout) mInflater.inflate(R.layout.notificationlayout, parent, false);
		} else {
			layoutItem = (LinearLayout) convertView;
		}
		  
		//(2) : Récupération des TextView de notre layout      
		TextView tv_Titre = (TextView)layoutItem.findViewById(R.id.tv_Titre);
		TextView tv_Date = (TextView)layoutItem.findViewById(R.id.tv_Date);
		      
		//(3) : Renseignement des valeurs       
		tv_Titre.setText(mListNotifications.get(position).getTitle());
		tv_Date.setText(mListNotifications.get(position).getDate());

		//en fonction du type, on changer la couleur de la bordure... à voir plus tard
		
		//On retourne l'item créé.
		return layoutItem;
	}
	
	public boolean addAll(List<Notification> notifications) {
		if (notifications == null || notifications.size() == 0) {
			return false;
		}
		mListNotifications.clear();
		return mListNotifications.addAll(notifications);
	}
}
