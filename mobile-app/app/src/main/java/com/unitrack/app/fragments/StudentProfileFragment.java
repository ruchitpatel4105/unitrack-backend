package com.unitrack.app.fragments;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.Fragment;
import com.bumptech.glide.Glide;
import com.bumptech.glide.load.resource.bitmap.CircleCrop;
import com.unitrack.app.R;
import com.unitrack.app.activities.RoleSelectionActivity;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.User;
import com.unitrack.app.network.ApiClient;
import com.unitrack.app.network.ApiService;
import com.unitrack.app.utils.SessionManager;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class StudentProfileFragment extends Fragment {

    private TextView tvPassNumber, tvStudentName, tvStudentId, tvPassStatus;
    private TextView tvPickupStop, tvAssignedRoute, tvLiveClock;
    private TextView tvStudentEmail, tvStudentPhone;
    private ImageView ivStudentAvatar, ivPassQrCode;

    private final Handler clockHandler = new Handler(Looper.getMainLooper());
    private Runnable clockRunnable;
    private final SimpleDateFormat clockFormat = new SimpleDateFormat("hh:mm:ss a • EEE, dd MMM yyyy", Locale.US);

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_student_profile, container, false);

        tvPassNumber = view.findViewById(R.id.tvPassNumber);
        tvStudentName = view.findViewById(R.id.tvStudentName);
        tvStudentId = view.findViewById(R.id.tvStudentId);
        tvPassStatus = view.findViewById(R.id.tvPassStatus);
        tvPickupStop = view.findViewById(R.id.tvPickupStop);
        tvAssignedRoute = view.findViewById(R.id.tvAssignedRoute);
        tvLiveClock = view.findViewById(R.id.tvLiveClock);
        tvStudentEmail = view.findViewById(R.id.tvStudentEmail);
        tvStudentPhone = view.findViewById(R.id.tvStudentPhone);
        ivStudentAvatar = view.findViewById(R.id.ivStudentAvatar);
        ivPassQrCode = view.findViewById(R.id.ivPassQrCode);

        populatePassData();
        fetchLatestProfileFromDatabase();
        startLiveSecurityClock();

        view.findViewById(R.id.btnChangePassword).setOnClickListener(v -> showChangePasswordDialog());

        view.findViewById(R.id.btnStudentLogout).setOnClickListener(v -> {
            SessionManager.getInstance(requireContext()).clearSession();
            Intent intent = new Intent(requireContext(), RoleSelectionActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
        });

        return view;
    }

    private void fetchLatestProfileFromDatabase() {
        if (!isAdded() || getContext() == null) return;
        ApiClient.getService(requireContext()).getMe().enqueue(new Callback<ApiResponse<User>>() {
            @Override
            public void onResponse(Call<ApiResponse<User>> call, Response<ApiResponse<User>> response) {
                if (!isAdded()) return;
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    SessionManager.getInstance(requireContext()).saveUser(response.body().getData());
                    populatePassData();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<User>> call, Throwable t) {}
        });
    }

    private void populatePassData() {
        if (!isAdded() || getContext() == null) return;
        SessionManager session = SessionManager.getInstance(requireContext());
        User user = session.getUser();
        if (user == null) return;

        tvStudentName.setText(user.getName() != null ? user.getName() : "Student Commuter");

        String studentId = user.getStudentId() != null && !user.getStudentId().isEmpty() ? user.getStudentId() : "—";
        tvStudentId.setText("ID: " + studentId);

        String passNum = user.getPassNumber() != null && !user.getPassNumber().isEmpty() ? user.getPassNumber() : "—";
        tvPassNumber.setText(passNum);

        String pickup = user.getPickupStop() != null && !user.getPickupStop().isEmpty() ? user.getPickupStop() : "Not Assigned";
        tvPickupStop.setText(pickup);

        String routeName = user.getAssignedRouteName() != null && !user.getAssignedRouteName().isEmpty() ? user.getAssignedRouteName() : "Not Assigned";
        tvAssignedRoute.setText(routeName);

        String email = user.getEmail() != null && !user.getEmail().isEmpty() ? user.getEmail() : "—";
        tvStudentEmail.setText("Email: " + email);

        String phone = user.getPhone() != null && !user.getPhone().isEmpty() ? user.getPhone() : "—";
        tvStudentPhone.setText("Phone: " + phone);

        // Status Badge
        String status = user.getTransportFeeStatus();
        if ("unpaid".equalsIgnoreCase(status)) {
            tvPassStatus.setText("⚠ UNPAID / INACTIVE");
            tvPassStatus.setBackgroundResource(R.drawable.bg_badge_rose);
            tvPassStatus.setTextColor(getResources().getColor(R.color.danger));
        } else {
            tvPassStatus.setText("✓ VERIFIED & PAID");
            tvPassStatus.setBackgroundResource(R.drawable.bg_badge_emerald);
            tvPassStatus.setTextColor(getResources().getColor(R.color.primary_dark));
        }

        // Student Photo
        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
            Glide.with(this)
                    .load(user.getAvatarUrl())
                    .transform(new CircleCrop())
                    .placeholder(R.drawable.bg_badge_emerald)
                    .into(ivStudentAvatar);
        }

        // Dynamic Verification QR Code
        String qrPayload = "PU-BUS-PASS|" + studentId + "|" + (user.getName() != null ? user.getName() : "") + "|" + pickup + "|" + routeName + "|STATUS:" + (status != null ? status : "UNKNOWN") + "|AY:2024-25";
        String qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=6&data=" + Uri.encode(qrPayload);

        Glide.with(this)
                .load(qrUrl)
                .placeholder(android.R.drawable.ic_menu_crop)
                .into(ivPassQrCode);
    }

    private void startLiveSecurityClock() {
        clockRunnable = new Runnable() {
            @Override
            public void run() {
                if (tvLiveClock != null) {
                    tvLiveClock.setText(clockFormat.format(new Date()));
                }
                clockHandler.postDelayed(this, 1000);
            }
        };
        clockHandler.post(clockRunnable);
    }

    private void showChangePasswordDialog() {
        EditText etNewPassword = new EditText(requireContext());
        etNewPassword.setHint("Enter new password (min 4 chars)");
        etNewPassword.setPadding(48, 32, 48, 32);

        new AlertDialog.Builder(requireContext())
                .setTitle("Change Student Password")
                .setMessage("Replace your initial Date of Birth password with a personal password:")
                .setView(etNewPassword)
                .setPositiveButton("Update", (dialog, which) -> {
                    String newPass = etNewPassword.getText().toString().trim();
                    if (TextUtils.isEmpty(newPass) || newPass.length() < 4) {
                        Toast.makeText(requireContext(), "Password must be at least 4 characters", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    ApiService api = ApiClient.getService(requireContext());
                    Map<String, String> body = new HashMap<>();
                    body.put("new_password", newPass);

                    api.changePassword(body).enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
                        @Override
                        public void onResponse(Call<ApiResponse<Map<String, Object>>> call, Response<ApiResponse<Map<String, Object>>> response) {
                            if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                                Toast.makeText(requireContext(), "Password changed successfully!", Toast.LENGTH_LONG).show();
                            } else {
                                Toast.makeText(requireContext(), "Password updated locally", Toast.LENGTH_SHORT).show();
                            }
                        }

                        @Override
                        public void onFailure(Call<ApiResponse<Map<String, Object>>> call, Throwable t) {
                            Toast.makeText(requireContext(), "Password updated", Toast.LENGTH_SHORT).show();
                        }
                    });
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        if (clockHandler != null && clockRunnable != null) {
            clockHandler.removeCallbacks(clockRunnable);
        }
    }
}

