package fr.oc.ocnotification.adapters;

import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentPagerAdapter;
import fr.oc.ocnotification.fragments.NotificationFragment;

public class NotificationPagerAdapter extends FragmentPagerAdapter {

	public NotificationPagerAdapter(FragmentManager fm) {
		super(fm);
	}

	@Override
	public Fragment getItem(int pos) {
		switch (pos) {
		case 0:
			return NotificationFragment.newInstance();
		case 1:
			return NotificationFragment.newInstance();
		case 2:
			return NotificationFragment.newInstance();
		}
		return null;
	}

	@Override
	public int getCount() {
		return 3;
	}

}
