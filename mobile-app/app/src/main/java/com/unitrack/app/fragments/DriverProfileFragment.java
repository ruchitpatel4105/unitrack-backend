package com.unitrack.app.fragments;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.unitrack.app.R;
import com.unitrack.app.activities.RoleSelectionActivity;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.User;
import com.unitrack.app.network.ApiClient;
import com.unitrack.app.utils.SessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DriverProfileFragment extends Fragment {

    private TextView tvName, tvId, tvEmail, tvPhone;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_driver_profile, container, false);

        tvName = view.findViewById(R.id.tvDriverProfileName);
        tvId = view.findViewById(R.id.tvDriverBadgeId);
        tvEmail = view.findViewById(R.id.tvDriverEmail);
        tvPhone = view.findViewById(R.id.tvDriverPhone);

        SessionManager session = SessionManager.getInstance(requireContext());
        User user = session.getUser();
        if (user != null) {
            displayDriver(user);
        }

        fetchDriverProfile();

        view.findViewById(R.id.btnDriverLogout).setOnClickListener(v -> {
            session.clearSession();
            Intent intent = new Intent(requireContext(), RoleSelectionActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
        });

        return view;
    }

    private void displayDriver(User user) {
        tvName.setText(user.getName() != null && !user.getName().isEmpty() ? user.getName() : "Driver");
        tvId.setText("Driver Badge: " + (user.getDriverId() != null && !user.getDriverId().isEmpty() ? user.getDriverId() : "—"));
        tvEmail.setText("Email: " + (user.getEmail() != null && !user.getEmail().isEmpty() ? user.getEmail() : "—"));
        tvPhone.setText("Phone: " + (user.getPhone() != null && !user.getPhone().isEmpty() ? user.getPhone() : "—"));
    }

    private void fetchDriverProfile() {
        if (!isAdded() || getContext() == null) return;
        ApiClient.getService(requireContext()).getMe().enqueue(new Callback<ApiResponse<User>>() {
            @Override
            public void onResponse(Call<ApiResponse<User>> call, Response<ApiResponse<User>> response) {
                if (!isAdded()) return;
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    User freshUser = response.body().getData();
                    SessionManager.getInstance(requireContext()).saveUser(freshUser);
                    displayDriver(freshUser);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<User>> call, Throwable t) {}
        });
    }
}
