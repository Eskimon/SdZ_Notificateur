package fr.oc.ocnotification.fragments;

import java.io.IOException;
import java.util.Map;

import org.jsoup.Connection.Method;
import org.jsoup.Connection.Response;
import org.jsoup.Jsoup;

import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import fr.oc.ocnotification.OCNotificationActivity;
import fr.oc.ocnotification.R;
import fr.oc.ocnotification.network.SessionStore;

/**
 * @author AndroWiiid
 */
public class LoginFragment extends Fragment {
	private EditText mEditTextUsername;
	private EditText mEditTextPassword;
	private Button mButtonSignIn;

	@Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container,
			Bundle savedInstanceState) {
		final View view = inflater.inflate(R.layout.fragment_login, container,
				false);
		mEditTextUsername = (EditText) view.findViewById(R.id.editTextUsername);
		mEditTextPassword = (EditText) view.findViewById(R.id.editTextPassword);
		mButtonSignIn = (Button) view.findViewById(R.id.buttonSignIn);
		mButtonSignIn.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				tryConnect();
			}
		});
		return view;
	}
	
	@Override
	public void onActivityCreated(Bundle savedInstanceState) {
		super.onActivityCreated(savedInstanceState);
		mEditTextUsername.setText(SessionStore.getLogin(getActivity()));
	}

	/**
	 * Try to connect if we fill all fields.
	 */
	private void tryConnect() {
		mButtonSignIn.setEnabled(false);
		mEditTextUsername.setError(null);
		mEditTextPassword.setError(null);

		boolean cancel = false;
		View focusView = null;

		final String username = mEditTextUsername.getText().toString();
		final String password = mEditTextPassword.getText().toString();

		// User must fill all fields.
		if (TextUtils.isEmpty(username)) {
			mEditTextUsername.setError(getString(R.string.error_no_value));
			cancel = true;
			focusView = mEditTextUsername;
		} else if (TextUtils.isEmpty(password)) {
			mEditTextPassword.setError(getString(R.string.error_no_value));
			cancel = true;
			focusView = mEditTextPassword;
		}
		// If there is one field empty, we indicate at the user. Otherwise, we
		// launch the connection request.
		if (cancel) {
			focusView.requestFocus();
			mButtonSignIn.setEnabled(true);
		} else {
			getActivity().setProgressBarIndeterminateVisibility(true);
			new ConnectAsyncTask().execute(username, password);
		}
	}

	/**
	 * Connect on OpenClassrooms to get cookies.
	 * 
	 * @author AndroWiiid
	 */
	private class ConnectAsyncTask extends
			AsyncTask<String, Void, Map<String, String>> {

		@Override
		protected Map<String, String> doInBackground(String... params) {
			final String username = params[0];
			final String password = params[1];
			Response login = null;
			try {
				login = Jsoup
						.connect("http://fr.openclassrooms.com/login_check")
						.cookie("PHPSESSID", "")
						.data("_username", username, "_password", password)
						.method(Method.POST).execute();
			} catch (IOException e) {
				e.printStackTrace();
			}
			// Response is correct with a good status code, we save cookies and
			// login.
			if (login != null && login.statusCode() == 200) {
				SessionStore.saveLogin(username, getActivity());
				return login.cookies();
			} else {
				return null;
			}
		}

		@Override
		protected void onPostExecute(Map<String, String> results) {
			super.onPostExecute(results);
			if (results == null || results.isEmpty()) {
				mButtonSignIn.setEnabled(true);
				return;
			}
			getActivity().setProgressBarIndeterminateVisibility(false);
			SessionStore.saveCookies(results, getActivity());
			mButtonSignIn.setEnabled(true);
			final Intent i = new Intent(getActivity(),
					OCNotificationActivity.class);
			startActivity(i);
		}
	}

}
