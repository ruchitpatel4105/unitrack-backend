package com.unitrack.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.button.MaterialButton;
import com.unitrack.app.R;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.User;
import com.unitrack.app.network.ApiClient;
import com.unitrack.app.socket.SocketManager;
import com.unitrack.app.utils.SessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProfileActivity extends AppCompatActivity {

    private ImageView btnBack;
    private ImageView ivAvatar;
    private TextView tvProfileName;
    private TextView tvProfileRole;
    private TextView tvProfileId;
    private TextView tvProfileEmail;
    private TextView tvProfilePhone;
    private MaterialButton btnLogout;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        btnBack = findViewById(R.id.btnBack);
        ivAvatar = findViewById(R.id.ivAvatar);
        tvProfileName = findViewById(R.id.tvProfileName);
        tvProfileRole = findViewById(R.id.tvProfileRole);
        tvProfileId = findViewById(R.id.tvProfileId);
        tvProfileEmail = findViewById(R.id.tvProfileEmail);
        tvProfilePhone = findViewById(R.id.tvProfilePhone);
        btnLogout = findViewById(R.id.btnLogout);

        btnBack.setOnClickListener(v -> finish());

        btnLogout.setOnClickListener(v -> logoutUser());

        loadUserProfile();
    }

    private void loadUserProfile() {
        User user = SessionManager.getInstance(this).getUser();
        if (user != null) {
            displayUser(user);
        }

        ApiClient.getService(this).getMe().enqueue(new Callback<ApiResponse<User>>() {
            @Override
            public void onResponse(Call<ApiResponse<User>> call, Response<ApiResponse<User>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    User freshUser = response.body().getData();
                    SessionManager.getInstance(ProfileActivity.this).saveUser(freshUser);
                    displayUser(freshUser);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<User>> call, Throwable t) {}
        });
    }

    private void displayUser(User user) {
        tvProfileName.setText(user.getName() != null && !user.getName().isEmpty() ? user.getName() : "University Member");
        tvProfileRole.setText(user.getRole() != null ? user.getRole().toUpperCase() : "STUDENT");
        
        if ("driver".equalsIgnoreCase(user.getRole())) {
            tvProfileId.setText("Driver ID: " + (user.getDriverId() != null && !user.getDriverId().isEmpty() ? user.getDriverId() : "—"));
        } else {
            tvProfileId.setText("Enrollment No: " + (user.getStudentId() != null && !user.getStudentId().isEmpty() ? user.getStudentId() : "—"));
        }

        tvProfileEmail.setText("Email: " + (user.getEmail() != null && !user.getEmail().isEmpty() ? user.getEmail() : "—"));
        tvProfilePhone.setText("Phone: " + (user.getPhone() != null && !user.getPhone().isEmpty() ? user.getPhone() : "—"));
    }

    private void logoutUser() {
        SocketManager.getInstance().disconnect();
        SessionManager.getInstance(this).clearSession();
        Intent intent = new Intent(this, RoleSelectionActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}
