package com.unitrack.app.utils;

import android.content.Context;
import android.content.SharedPreferences;
import com.google.gson.Gson;
import com.unitrack.app.models.User;

public class SessionManager {
    private static final String PREF_NAME = "unitrack_session_pref";
    private static final String KEY_TOKEN = "key_auth_token";
    private static final String KEY_USER = "key_user_json";
    private static final String KEY_ROLE = "key_active_role";
    private static final String KEY_IS_LOGGED_IN = "key_is_logged_in";

    private final SharedPreferences prefs;
    private final SharedPreferences.Editor editor;
    private final Gson gson;
    private static SessionManager instance;

    public SessionManager(Context context) {
        prefs = context.getApplicationContext().getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        editor = prefs.edit();
        gson = new Gson();
    }

    public static synchronized SessionManager getInstance(Context context) {
        if (instance == null) {
            instance = new SessionManager(context);
        }
        return instance;
    }

    public void saveSession(String token, User user) {
        editor.putString(KEY_TOKEN, token);
        editor.putString(KEY_USER, gson.toJson(user));
        if (user != null && user.getRole() != null) {
            editor.putString(KEY_ROLE, user.getRole());
        }
        editor.putBoolean(KEY_IS_LOGGED_IN, true);
        editor.apply();
    }

    public void saveActiveRole(String role) {
        editor.putString(KEY_ROLE, role);
        editor.apply();
    }

    public String getActiveRole() {
        return prefs.getString(KEY_ROLE, null);
    }

    public String getToken() {
        return prefs.getString(KEY_TOKEN, null);
    }

    public User getUser() {
        String userJson = prefs.getString(KEY_USER, null);
        if (userJson != null) {
            try {
                return gson.fromJson(userJson, User.class);
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    public boolean isLoggedIn() {
        return prefs.getBoolean(KEY_IS_LOGGED_IN, false) && getToken() != null;
    }

    public void setServerUrl(String url) {
        editor.putString("key_server_url", url);
        editor.apply();
    }

    public String getServerUrl() {
        String saved = prefs.getString("key_server_url", null);
        if (saved == null || saved.contains("127.0.0.1") || saved.contains("10.0.2.2") || saved.contains("trycloudflare.com") || !saved.contains("onrender.com")) {
            return Constants.BASE_URL;
        }
        return saved;
    }

    public void clearSession() {
        String selectedRole = getActiveRole();
        String serverUrl = prefs.getString("key_server_url", null);
        editor.clear();
        if (selectedRole != null) {
            editor.putString(KEY_ROLE, selectedRole);
        }
        if (serverUrl != null) {
            editor.putString("key_server_url", serverUrl);
        }
        editor.apply();
    }
}
