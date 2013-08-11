package eskimon.sdznotificateur;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;

import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;

import android.util.Log;

public class Notification {
	public final static String sdz = "http://www.siteduzero.com";
	
	public int id;
	public String title;
	public String date;
	public String messageId;
	public String thread;
	public String type;
	
	
	/*
 var notifObj = {
	id: archiveLink.substr(archiveLink.lastIndexOf("/") + 1),
	title: notif.find("li.title").text(),
	date: notif.find("li.date").text(),
	messageId: notifLink.substr(notifLink.lastIndexOf("/") + 1),
	thread: notifLink.substr(13, notifLink.lastIndexOf("/") - 13),
	type: notif.find("a.badgeSdz").text().length==0 ? "forum" : "badge" //si c'est un badge
};
	 */
	
	
	
	
	public Notification(String title, String date) {
		this.title = title;
		this.date = date;
	}
	
	public static ArrayList<Notification> check() {
		ArrayList<Notification> ret = new ArrayList<Notification>();
		
		for(int i=0; i<5; i++) {
			ret.add(new Notification("titre "+i, "date "+i));
		}
		
		
		
		
		HttpClient client = new DefaultHttpClient();
		HttpGet request = new HttpGet(Notification.sdz);
		HttpResponse response;
		try {
			response = client.execute(request);
			String html = "";
			InputStream in = response.getEntity().getContent();
			BufferedReader reader = new BufferedReader(new InputStreamReader(in));
			StringBuilder str = new StringBuilder();
			String line = null;
			while((line = reader.readLine()) != null)
			{
			    str.append(line);
			}
			in.close();
			html = str.toString(); //le code source est alors stocké dans "html"
		} catch (ClientProtocolException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return ret;
	}
}
