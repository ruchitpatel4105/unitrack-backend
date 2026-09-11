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

public class StudentRegisterActivity extends AppCompatActivity {

    private EditText etName, etStudentId, etEmail, etPhone, etPassword;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Toast.makeText(this, "Self-registration is disabled. Please log in using your 13-digit Enrollment ID and Date of Birth.", Toast.LENGTH_LONG).show();
        finish();
    }


    private void showServerConfigDialog() {
        android.widget.EditText input = new android.widget.EditText(this);
        input.setText(SessionManager.getInstance(this).getServerUrl());
        input.setPadding(40, 30, 40, 30);

        new androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("Backend Server Address")
                .setMessage("Using USB? Keep http://127.0.0.1:5000/api/\nUsing Wi-Fi? Enter your PC IP (e.g. http://10.217.10.42:5000/api/):")
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

    private void performRegister() {
        String name = etName.getText().toString().trim();
        String studentId = etStudentId.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String phone = etPhone.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (name.isEmpty() || studentId.isEmpty() || email.isEmpty() || phone.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Please fill in all mandatory fields", Toast.LENGTH_SHORT).show();
            return;
        }

        // Validate 13-digit Parul University Enrollment Number
        if (!studentId.matches("^\\d{13}$")) {
            etStudentId.setError("Enrollment number must be exactly 13 digits (e.g. 2403051057034)");
            etStudentId.requestFocus();
            return;
        }

        // Validate University Email
        String expectedEmail = studentId + "@paruluniversity.ac.in";
        if (!email.equalsIgnoreCase(expectedEmail)) {
            etEmail.setError("Email must match: " + expectedEmail);
            etEmail.requestFocus();
            return;
        }

        progressBar.setVisibility(View.VISIBLE);

        Map<String, String> body = new HashMap<>();
        body.put("name", name);
        body.put("student_id", studentId);
        body.put("email", email);
        body.put("phone", phone);
        body.put("password", password);
        body.put("role", Constants.ROLE_STUDENT);

        ApiClient.getService(this).register(body).enqueue(new Callback<AuthResponse>() {
            @Override
            public void onResponse(Call<AuthResponse> call, Response<AuthResponse> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    SessionManager.getInstance(StudentRegisterActivity.this).saveSession(
                            response.body().getToken(),
                            response.body().getUser()
                    );
                    SessionManager.getInstance(StudentRegisterActivity.this).saveActiveRole(Constants.ROLE_STUDENT);

                    Toast.makeText(StudentRegisterActivity.this, "Registration Successful!", Toast.LENGTH_SHORT).show();
                    Intent intent = new Intent(StudentRegisterActivity.this, StudentDashboardActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(intent);
                    finish();
                } else {
                    String msg = (response.body() != null) ? response.body().getMessage() : "Registration failed";
                    Toast.makeText(StudentRegisterActivity.this, msg, Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<AuthResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                String error = t.getMessage() != null ? t.getMessage() : "Unknown error";
                if (error.contains("Failed to connect") || error.contains("ConnectException") || error.contains("timeout")) {
                    new androidx.appcompat.app.AlertDialog.Builder(StudentRegisterActivity.this)
                            .setTitle("Connection Error")
                            .setMessage("Failed to reach server at:\n" + SessionManager.getInstance(StudentRegisterActivity.this).getServerUrl() + "\n\n• If using USB: Ensure 'adb reverse tcp:5000 tcp:5000' is running.\n• If using Wi-Fi: Tap 'Configure Server' and enter your laptop's IP address (e.g., http://10.217.10.42:5000/api/).")
                            .setPositiveButton("Configure Server", (d, w) -> showServerConfigDialog())
                            .setNegativeButton("Dismiss", null)
                            .show();
                } else {
                    Toast.makeText(StudentRegisterActivity.this, "Error: " + error, Toast.LENGTH_LONG).show();
                }
            }
        });
    }
}
