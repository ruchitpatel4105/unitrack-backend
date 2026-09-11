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
import com.unitrack.app.activities.DriverEmergencyActivity;
import com.unitrack.app.activities.DriverTripActivity;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.Trip;
import com.unitrack.app.models.User;
import com.unitrack.app.network.ApiClient;
import com.unitrack.app.utils.SessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DriverDashboardFragment extends Fragment {

    private TextView tvDriverName, tvAssignedBusNumber, tvAssignedRouteName;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_driver_dashboard, container, false);

        tvDriverName = view.findViewById(R.id.tvDriverName);
        tvAssignedBusNumber = view.findViewById(R.id.tvAssignedBusNumber);
        tvAssignedRouteName = view.findViewById(R.id.tvAssignedRouteName);

        User user = SessionManager.getInstance(requireContext()).getUser();
        if (user != null) {
            tvDriverName.setText(user.getName() + " (" + (user.getDriverId() != null ? user.getDriverId() : "DRV-101") + ")");
        }

        view.findViewById(R.id.btnGoToTrip).setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), DriverTripActivity.class));
        });

        view.findViewById(R.id.btnQuickEmergency).setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), DriverEmergencyActivity.class));
        });

        fetchDriverTrip();

        return view;
    }

    private void fetchDriverTrip() {
        ApiClient.getService(requireContext()).getDriverCurrentTrip().enqueue(new Callback<ApiResponse<Trip>>() {
            @Override
            public void onResponse(Call<ApiResponse<Trip>> call, Response<ApiResponse<Trip>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    Trip trip = response.body().getData();
                    tvAssignedBusNumber.setText(trip.getBusNumber() + " • " + trip.getLicensePlate());
                    tvAssignedRouteName.setText("Route: " + trip.getRouteName());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Trip>> call, Throwable t) {}
        });
    }
}
