package eskimon.sdznotificateur;

import java.util.ArrayList;

import android.app.Activity;
import android.os.Bundle;
import android.widget.ListView;

public class SdZNotificateurActivity extends Activity {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
               
        //Récupération de la liste des personnes
        ArrayList<Notification> listOfNotif = Notification.check();
    		
    	//Création et initialisation de l'Adapter pour les personnes
        NotificationAdapter adapter = new NotificationAdapter(this, listOfNotif);
            
        //Récupération du composant ListView
        ListView list = (ListView)findViewById(R.id.laListe);
            
        //Initialisation de la liste avec les données
        list.setAdapter(adapter);
    }
}