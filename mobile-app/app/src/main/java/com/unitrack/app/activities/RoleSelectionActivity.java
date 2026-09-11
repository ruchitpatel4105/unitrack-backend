package com.unitrack.app.activities;

import android.content.Intent;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import com.unitrack.app.R;
import com.unitrack.app.utils.Constants;
import com.unitrack.app.utils.SessionManager;

public class RoleSelectionActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_role_selection);

        findViewById(R.id.cardStudent).setOnClickListener(v -> {
            SessionManager.getInstance(this).saveActiveRole(Constants.ROLE_STUDENT);
            startActivity(new Intent(this, StudentLoginActivity.class));
        });

        findViewById(R.id.cardDriver).setOnClickListener(v -> {
            SessionManager.getInstance(this).saveActiveRole(Constants.ROLE_DRIVER);
            startActivity(new Intent(this, DriverLoginActivity.class));
        });
    }
}
