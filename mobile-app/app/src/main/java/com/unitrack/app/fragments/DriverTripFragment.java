package com.unitrack.app.fragments;

import android.content.Intent;
import android.location.Location;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import com.unitrack.app.R;
import com.unitrack.app.activities.DriverEmergencyActivity;
import com.unitrack.app.gps.LocationHelper;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.Trip;
import com.unitrack.app.network.ApiClient;
import com.unitrack.app.services.GpsTrackingService;
import com.unitrack.app.socket.SocketManager;
import com.unitrack.app.utils.Constants;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DriverTripFragment extends Fragment {

    private TextView tvRouteName, tvBus, tvSpeed, tvAccuracy;
    private Button btnTripToggle, btnEmergency;
    private LocationHelper locationHelper;
    private boolean isTripActive = true;
    private Trip currentTrip;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_driver_trip, container, false);

        tvRouteName = view.findViewById(R.id.tvFragTripRouteName);
        tvBus = view.findViewById(R.id.tvFragTripBus);
        tvSpeed = view.findViewById(R.id.tvFragSpeed);
        tvAccuracy = view.findViewById(R.id.tvFragAccuracy);
        btnTripToggle = view.findViewById(R.id.btnTripStartEnd);
        btnEmergency = view.findViewById(R.id.btnFragEmergency);

        locationHelper = new LocationHelper(requireContext());

        btnTripToggle.setOnClickListener(v -> {
            if (isTripActive) {
                endTrip();
            } else {
                startTrip();
            }
        });

        btnEmergency.setOnClickListener(v -> {
            Intent intent = new Intent(requireContext(), DriverEmergencyActivity.class);
            if (currentTrip != null) {
                intent.putExtra(Constants.EXTRA_BUS_ID, currentTrip.getBusId());
            }
            startActivity(intent);
        });

        fetchTrip();

        return view;
    }

    private void fetchTrip() {
        if (!isAdded() || getContext() == null) return;
        ApiClient.getService(requireContext()).getDriverCurrentTrip().enqueue(new Callback<ApiResponse<Trip>>() {
            @Override
            public void onResponse(Call<ApiResponse<Trip>> call, Response<ApiResponse<Trip>> response) {
                if (!isAdded()) return;
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    currentTrip = response.body().getData();
                    tvRouteName.setText(currentTrip.getRouteName() != null ? currentTrip.getRouteName() : "Route Assigned");
                    tvBus.setText("Vehicle: Bus " + currentTrip.getBusNumber() + " • " + currentTrip.getLicensePlate());
                    isTripActive = true;
                    btnTripToggle.setText("Conclude Trip");
                    btnTripToggle.setEnabled(true);
                    startGpsService();
                } else {
                    currentTrip = null;
                    tvRouteName.setText("No Active Trip Assigned");
                    tvBus.setText("No Bus Assigned");
                    isTripActive = false;
                    btnTripToggle.setText("No Active Schedule");
                    btnTripToggle.setEnabled(false);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Trip>> call, Throwable t) {
                if (!isAdded()) return;
                currentTrip = null;
                tvRouteName.setText("No Active Trip Assigned");
                tvBus.setText("No Bus Assigned");
                isTripActive = false;
                btnTripToggle.setText("No Active Schedule");
                btnTripToggle.setEnabled(false);
            }
        });
    }

    private void startTrip() {
        if (currentTrip == null) {
            Toast.makeText(requireContext(), "No active trip assigned.", Toast.LENGTH_SHORT).show();
            return;
        }
        isTripActive = true;
        btnTripToggle.setText("Conclude Trip");
        startGpsService();
        Toast.makeText(requireContext(), "Trip commenced! GPS beacon broadcasting live telemetry.", Toast.LENGTH_SHORT).show();
    }

    private void endTrip() {
        isTripActive = false;
        btnTripToggle.setText("Start Scheduled Trip");
        stopGpsService();
        Toast.makeText(requireContext(), "Trip concluded successfully.", Toast.LENGTH_SHORT).show();
    }

    private void startGpsService() {
        if (currentTrip == null || !isAdded()) return;
        Intent serviceIntent = new Intent(requireContext(), GpsTrackingService.class);
        serviceIntent.putExtra(Constants.EXTRA_BUS_ID, currentTrip.getBusId());
        serviceIntent.putExtra("extra_trip_id", currentTrip.getId());
        ContextCompat.startForegroundService(requireContext(), serviceIntent);

        locationHelper.startLocationUpdates(3000, new LocationHelper.OnLocationUpdatedListener() {
            @Override
            public void onLocationChanged(Location location) {
                if (getActivity() == null) return;
                getActivity().runOnUiThread(() -> {
                    tvSpeed.setText("ACTIVE");
                    tvAccuracy.setText(location.hasAccuracy() ? String.format(java.util.Locale.US, "±%.0fm", location.getAccuracy()) : "—");
                });
            }
        });
    }

    private void stopGpsService() {
        Intent serviceIntent = new Intent(requireContext(), GpsTrackingService.class);
        requireContext().stopService(serviceIntent);
        locationHelper.stopLocationUpdates();
        if (tvSpeed != null) tvSpeed.setText("STANDBY");
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (locationHelper != null) locationHelper.stopLocationUpdates();
    }
}
