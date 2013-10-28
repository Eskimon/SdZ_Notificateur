package fr.oc.ocnotification.adapters;

import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentPagerAdapter;
import fr.oc.ocnotification.fragments.NotificationFragment;

public class NotificationPagerAdapter extends FragmentPagerAdapter {
	private static final int COUNT = 3;
	public static final int NOTIFICATIONS = 0;
	public static final int PMS = 1;
	public static final int ALERTS = 2;

	public NotificationPagerAdapter(FragmentManager fm) {
		super(fm);
	}

	@Override
	public Fragment getItem(int pos) {
		switch (pos) {
		case NOTIFICATIONS:
			return NotificationFragment.newInstance(pos);
		case PMS:
			return NotificationFragment.newInstance(pos);
		case ALERTS:
			return NotificationFragment.newInstance(pos);
		}
		return null;
	}

	@Override
	public int getCount() {
		return COUNT;
	}

}
