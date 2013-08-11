package eskimon.sdznotificateur;

import java.util.List;

import android.content.Context;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.LinearLayout;
import android.widget.TextView;

public class NotificationAdapter extends BaseAdapter {

	// Une liste de personnes
	private List<Notification> listNotifications;
	    	
	//Le contexte dans lequel est présent notre adapter
	private Context ctx;
	    	
	//Un mécanisme pour gérer l'affichage graphique depuis un layout XML
	private LayoutInflater inflater;

	public NotificationAdapter(Context context, List<Notification> aListN) {
		this.ctx = context;
		this.listNotifications = aListN;
		this.inflater = LayoutInflater.from(context);
	}
	
	@Override
	public int getCount() {
		return this.listNotifications.size();
	}

	@Override
	public Object getItem(int pos) {
		return this.listNotifications.get(pos);
	}

	@Override
	public long getItemId(int pos) {
		return this.listNotifications.get(pos).id;
	}

	@Override
	public View getView(int position, View convertView, ViewGroup parent) {
		LinearLayout layoutItem;
		//(1) : Réutilisation des layouts
		if (convertView == null) {
			//Initialisation de notre item à partir du  layout XML "personne_layout.xml"
		  layoutItem = (LinearLayout) inflater.inflate(R.layout.notificationlayout, parent, false);
		} else {
			layoutItem = (LinearLayout) convertView;
		}
		  
		//(2) : Récupération des TextView de notre layout      
		TextView tv_Titre = (TextView)layoutItem.findViewById(R.id.tv_Titre);
		TextView tv_Date = (TextView)layoutItem.findViewById(R.id.tv_Date);
		      
		//(3) : Renseignement des valeurs       
		tv_Titre.setText(listNotifications.get(position).title);
		tv_Date.setText(listNotifications.get(position).date);

		//en fonction du type, on changer la couleur de la bordure... à voir plus tard
		
		//On retourne l'item créé.
		return layoutItem;
	}
}
