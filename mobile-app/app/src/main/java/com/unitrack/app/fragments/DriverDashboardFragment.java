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
import com.unitrack.app.utils.Constants;
import com.unitrack.app.utils.SessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DriverDashboardFragment extends Fragment {

    private TextView tvDriverName, tvAssignedBusNumber, tvAssignedRouteName;
    private Trip activeTrip;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_driver_dashboard, container, false);

        tvDriverName = view.findViewById(R.id.tvDriverName);
        tvAssignedBusNumber = view.findViewById(R.id.tvAssignedBusNumber);
        tvAssignedRouteName = view.findViewById(R.id.tvAssignedRouteName);

        User user = SessionManager.getInstance(requireContext()).getUser();
        if (user != null) {
            String driverLabel = user.getName() != null && !user.getName().isEmpty() ? user.getName() : "Driver";
            if (user.getDriverId() != null && !user.getDriverId().isEmpty()) {
                driverLabel += " (" + user.getDriverId() + ")";
            }
            tvDriverName.setText(driverLabel);
        }

        view.findViewById(R.id.btnGoToTrip).setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), DriverTripActivity.class));
        });

        view.findViewById(R.id.btnQuickEmergency).setOnClickListener(v -> {
            Intent intent = new Intent(requireContext(), DriverEmergencyActivity.class);
            if (activeTrip != null) {
                intent.putExtra(Constants.EXTRA_BUS_ID, activeTrip.getBusId());
            }
            startActivity(intent);
        });

        fetchDriverTrip();
        fetchDriverProfile();

        return view;
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
                    String driverLabel = freshUser.getName() != null && !freshUser.getName().isEmpty() ? freshUser.getName() : "Driver";
                    if (freshUser.getDriverId() != null && !freshUser.getDriverId().isEmpty()) {
                        driverLabel += " (" + freshUser.getDriverId() + ")";
                    }
                    tvDriverName.setText(driverLabel);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<User>> call, Throwable t) {}
        });
    }

    private void fetchDriverTrip() {
        if (!isAdded() || getContext() == null) return;
        ApiClient.getService(requireContext()).getDriverCurrentTrip().enqueue(new Callback<ApiResponse<Trip>>() {
            @Override
            public void onResponse(Call<ApiResponse<Trip>> call, Response<ApiResponse<Trip>> response) {
                if (!isAdded()) return;
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    activeTrip = response.body().getData();
                    tvAssignedBusNumber.setText("Bus " + activeTrip.getBusNumber() + " • " + activeTrip.getLicensePlate());
                    tvAssignedRouteName.setText("Route: " + (activeTrip.getRouteName() != null ? activeTrip.getRouteName() : "—"));
                } else {
                    activeTrip = null;
                    tvAssignedBusNumber.setText("No Active Bus Assigned");
                    tvAssignedRouteName.setText("No Active Route Assigned");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Trip>> call, Throwable t) {
                if (!isAdded()) return;
                activeTrip = null;
                tvAssignedBusNumber.setText("No Active Bus Assigned");
                tvAssignedRouteName.setText("No Active Route Assigned");
            }
        });
    }
}
