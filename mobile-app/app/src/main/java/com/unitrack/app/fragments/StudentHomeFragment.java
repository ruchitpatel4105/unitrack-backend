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
import com.unitrack.app.activities.LiveBusActivity;
import com.unitrack.app.activities.NotificationsActivity;
import com.unitrack.app.activities.RouteListActivity;
import com.unitrack.app.activities.LostFoundListActivity;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.Trip;
import com.unitrack.app.models.User;
import com.unitrack.app.network.ApiClient;
import com.unitrack.app.utils.SessionManager;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class StudentHomeFragment extends Fragment {

    private TextView tvStudentName;
    private TextView tvBannerActiveBuses;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_student_home, container, false);

        tvStudentName = view.findViewById(R.id.tvStudentName);
        tvBannerActiveBuses = view.findViewById(R.id.tvBannerActiveBuses);

        User user = SessionManager.getInstance(requireContext()).getUser();
        if (user != null && user.getName() != null && !user.getName().isEmpty()) {
            tvStudentName.setText(user.getName());
        }

        loadLiveFleetData();

        // Live Tracker Banner Click
        view.findViewById(R.id.btnTrackNow).setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), LiveBusActivity.class));
        });
        view.findViewById(R.id.cardLiveTransit).setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), LiveBusActivity.class));
        });

        // Routes Shortcut
        view.findViewById(R.id.cardRoutesShortcut).setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), RouteListActivity.class));
        });

        // Lost & Found Shortcut
        view.findViewById(R.id.cardLostFoundShortcut).setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), LostFoundListActivity.class));
        });

        // Notifications Icon
        view.findViewById(R.id.btnNotifications).setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), NotificationsActivity.class));
        });

        return view;
    }

    private void loadLiveFleetData() {
        if (!isAdded() || getContext() == null) return;

        ApiClient.getService(requireContext()).getActiveTrips().enqueue(new Callback<ApiResponse<List<Trip>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Trip>>> call, Response<ApiResponse<List<Trip>>> response) {
                if (!isAdded()) return;
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    List<Trip> trips = response.body().getData();
                    if (!trips.isEmpty()) {
                        tvBannerActiveBuses.setText(trips.size() + " " + (trips.size() == 1 ? "Shuttle" : "Shuttles") + " Operating Now");
                    } else {
                        tvBannerActiveBuses.setText("No Active Shuttles Operating");
                    }
                } else {
                    tvBannerActiveBuses.setText("Transit Network Ready");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Trip>>> call, Throwable t) {
                if (!isAdded()) return;
                tvBannerActiveBuses.setText("Transit Network Ready");
            }
        });

        ApiClient.getService(requireContext()).getMe().enqueue(new Callback<ApiResponse<User>>() {
            @Override
            public void onResponse(Call<ApiResponse<User>> call, Response<ApiResponse<User>> response) {
                if (!isAdded()) return;
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    User freshUser = response.body().getData();
                    SessionManager.getInstance(requireContext()).saveUser(freshUser);
                    if (freshUser.getName() != null && !freshUser.getName().isEmpty()) {
                        tvStudentName.setText(freshUser.getName());
                    }
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<User>> call, Throwable t) {}
        });
    }
}
