package com.unitrack.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.unitrack.app.R;
import com.unitrack.app.models.AuthResponse;
import com.unitrack.app.network.ApiClient;
import com.unitrack.app.utils.Constants;
import com.unitrack.app.utils.SessionManager;
import java.util.HashMap;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class StudentLoginActivity extends AppCompatActivity {

    private EditText etIdentifier, etPassword;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_student_login);

        etIdentifier = findViewById(R.id.etIdentifier);
        etPassword = findViewById(R.id.etPassword);
        progressBar = findViewById(R.id.progressBar);

        findViewById(R.id.btnLogin).setOnClickListener(v -> performLogin());

        findViewById(R.id.btnDemoStudent).setOnClickListener(v -> {
            etIdentifier.setText("2403051057034");
            etPassword.setText("15082004");
            Toast.makeText(this, "Demo student loaded: DOB password (15082004)", Toast.LENGTH_SHORT).show();
        });

        // Long press welcome text to configure server IP if needed
        findViewById(R.id.tvWelcomeBack).setOnLongClickListener(v -> {
            showServerConfigDialog();
            return true;
        });

        findViewById(R.id.tvForgotPassword).setOnClickListener(v -> {
            startActivity(new Intent(this, ForgotPasswordActivity.class));
        });
    }


    private void showServerConfigDialog() {
        android.widget.EditText input = new android.widget.EditText(this);
        input.setText(SessionManager.getInstance(this).getServerUrl());
        input.setPadding(40, 30, 40, 30);

        new androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("Backend Server Address")
                .setMessage("Using USB? Keep http://127.0.0.1:5000/api/\nUsing Wi-Fi? Enter your PC IP address:")
                .setView(input)
                .setPositiveButton("Save", (dialog, which) -> {
                    String newUrl = input.getText().toString().trim();
                    if (!newUrl.endsWith("/")) newUrl += "/";
                    SessionManager.getInstance(this).setServerUrl(newUrl);
                    ApiClient.reset();
                    Toast.makeText(this, "Server updated to: " + newUrl, Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Cancel", null)
                .setNeutralButton("Reset USB", (dialog, which) -> {
                    SessionManager.getInstance(this).setServerUrl(Constants.BASE_URL);
                    ApiClient.reset();
                    Toast.makeText(this, "Reset to USB default (127.0.0.1)", Toast.LENGTH_SHORT).show();
                })
                .show();
    }

    private void performLogin() {
        String identifier = etIdentifier.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (identifier.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Please enter Student ID and Password", Toast.LENGTH_SHORT).show();
            return;
        }

        progressBar.setVisibility(View.VISIBLE);

        Map<String, String> body = new HashMap<>();
        body.put("identifier", identifier);
        body.put("password", password);
        body.put("role", Constants.ROLE_STUDENT);

        ApiClient.getService(this).login(body).enqueue(new Callback<AuthResponse>() {
            @Override
            public void onResponse(Call<AuthResponse> call, Response<AuthResponse> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    SessionManager.getInstance(StudentLoginActivity.this).saveSession(
                            response.body().getToken(),
                            response.body().getUser()
                    );
                    SessionManager.getInstance(StudentLoginActivity.this).saveActiveRole(Constants.ROLE_STUDENT);

                    Toast.makeText(StudentLoginActivity.this, "Welcome, " + response.body().getUser().getName(), Toast.LENGTH_SHORT).show();
                    Intent intent = new Intent(StudentLoginActivity.this, StudentDashboardActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(intent);
                    finish();
                } else {
                    String msg = (response.body() != null) ? response.body().getMessage() : "Invalid credentials";
                    Toast.makeText(StudentLoginActivity.this, msg, Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<AuthResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(StudentLoginActivity.this, "Connection failed: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }
}
