package com.unitrack.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import androidx.appcompat.app.AppCompatActivity;
import com.unitrack.app.R;
import com.unitrack.app.models.User;
import com.unitrack.app.utils.Constants;
import com.unitrack.app.utils.SessionManager;

public class SplashActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            SessionManager sessionManager = SessionManager.getInstance(this);

            if (sessionManager.isLoggedIn()) {
                User user = sessionManager.getUser();
                String role = sessionManager.getActiveRole();

                if (Constants.ROLE_DRIVER.equalsIgnoreCase(role) || (user != null && Constants.ROLE_DRIVER.equalsIgnoreCase(user.getRole()))) {
                    startActivity(new Intent(this, DriverDashboardActivity.class));
                } else {
                    startActivity(new Intent(this, StudentDashboardActivity.class));
                }
            } else {
                startActivity(new Intent(this, RoleSelectionActivity.class));
            }
            finish();
        }, 1500);
    }
}
