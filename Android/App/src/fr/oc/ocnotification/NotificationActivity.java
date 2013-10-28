package fr.oc.ocnotification;

import android.os.Bundle;
import android.support.v4.app.FragmentTransaction;
import android.support.v4.view.ViewPager;
import android.support.v4.view.ViewPager.SimpleOnPageChangeListener;

import com.actionbarsherlock.app.ActionBar;
import com.actionbarsherlock.app.ActionBar.Tab;
import com.actionbarsherlock.app.ActionBar.TabListener;
import com.actionbarsherlock.app.SherlockFragmentActivity;

import fr.oc.ocnotification.adapters.NotificationPagerAdapter;

/**
 * @author AndroWiiid
 */
public class NotificationActivity extends SherlockFragmentActivity {
	private ViewPager mViewPager;
	private ActionBar mActionBar;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_notification);

		mViewPager = (ViewPager) findViewById(R.id.viewPager);

		final NotificationPagerAdapter adapter = new NotificationPagerAdapter(
				getSupportFragmentManager());
		mViewPager.setAdapter(adapter);
		mViewPager.setOnPageChangeListener(mViewPagerOnPageChangeListener);

		mActionBar = getSupportActionBar();
		mActionBar.setNavigationMode(ActionBar.NAVIGATION_MODE_TABS);

		// Create first Tab
		Tab tab = mActionBar.newTab().setText(R.string.title_notif)
				.setTabListener(mTabListener);
		mActionBar.addTab(tab);

		// Create second Tab
		tab = mActionBar.newTab().setText(R.string.title_pm)
				.setTabListener(mTabListener);
		mActionBar.addTab(tab);

		// Create third Tab
		tab = mActionBar.newTab().setText(R.string.title_alert)
				.setTabListener(mTabListener);
		mActionBar.addTab(tab);
	}

	private final SimpleOnPageChangeListener mViewPagerOnPageChangeListener = new SimpleOnPageChangeListener() {
		@Override
		public void onPageSelected(int position) {
			mActionBar.setSelectedNavigationItem(position);
		}
	};

	private final TabListener mTabListener = new TabListener() {

		@Override
		public void onTabUnselected(Tab tab, FragmentTransaction ft) {
		}

		@Override
		public void onTabSelected(Tab tab, FragmentTransaction ft) {
			mViewPager.setCurrentItem(tab.getPosition());
		}

		@Override
		public void onTabReselected(Tab tab, FragmentTransaction ft) {
		}
	};
}