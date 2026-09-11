package com.unitrack.app.activities;

import android.os.Bundle;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.unitrack.app.R;

public class ForgotPasswordActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forgot_password);

        EditText etId = findViewById(R.id.etResetIdentifier);
        findViewById(R.id.btnSendReset).setOnClickListener(v -> {
            String id = etId.getText().toString().trim();
            if (id.isEmpty()) {
                Toast.makeText(this, "Please enter your email or student ID", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(this, "Reset instructions dispatched to " + id, Toast.LENGTH_LONG).show();
                finish();
            }
        });
    }
}
