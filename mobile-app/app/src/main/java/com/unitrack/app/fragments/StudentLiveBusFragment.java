package com.unitrack.app.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Spinner;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;
import com.unitrack.app.R;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.LocationUpdate;
import com.unitrack.app.models.Trip;
import com.unitrack.app.network.ApiClient;
import com.unitrack.app.socket.SocketManager;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class StudentLiveBusFragment extends Fragment implements OnMapReadyCallback {

    private GoogleMap googleMap;
    private Marker busMarker;
    private TextView tvBusNumber, tvBusRoute, tvSpeedBadge, tvEta, tvLiveCoords, tvLiveTelemetrySpeed;
    private View telemetryFallback;
    private Spinner spBusSelect;
    private List<Trip> activeTrips = new ArrayList<>();
    private Trip selectedTrip;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_student_live_bus, container, false);

        tvBusNumber = view.findViewById(R.id.tvSelectedBusNumber);
        tvBusRoute = view.findViewById(R.id.tvSelectedBusRoute);
        tvSpeedBadge = view.findViewById(R.id.tvLiveSpeedBadge);
        tvEta = view.findViewById(R.id.tvEtaNextStop);
        tvLiveCoords = view.findViewById(R.id.tvLiveCoords);
        tvLiveTelemetrySpeed = view.findViewById(R.id.tvLiveTelemetrySpeed);
        telemetryFallback = view.findViewById(R.id.telemetryFallback);
        spBusSelect = view.findViewById(R.id.spActiveBusSelect);

        SupportMapFragment mapFragment = (SupportMapFragment) getChildFragmentManager().findFragmentById(R.id.mapFragment);
        if (mapFragment != null) {
            mapFragment.getMapAsync(this);
        } else {
            telemetryFallback.setVisibility(View.VISIBLE);
        }

        fetchActiveTrips();
        setupSocketListener();

        return view;
    }

    private void fetchActiveTrips() {
        ApiClient.getService(requireContext()).getActiveTrips().enqueue(new Callback<ApiResponse<List<Trip>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Trip>>> call, Response<ApiResponse<List<Trip>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    activeTrips = response.body().getData();
                    setupSpinner();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Trip>>> call, Throwable t) {
                telemetryFallback.setVisibility(View.VISIBLE);
            }
        });
    }

    private void setupSpinner() {
        if (!isAdded() || getContext() == null) return;
        List<String> labels = new ArrayList<>();
        for (Trip t : activeTrips) {
            labels.add(t.getBusNumber() + " - " + t.getRouteName());
        }

        if (labels.isEmpty()) {
            labels.add("BUS-101 - Campus Express - North Route");
        }

        ArrayAdapter<String> adapter = new ArrayAdapter<>(requireContext(), android.R.layout.simple_spinner_dropdown_item, labels);
        spBusSelect.setAdapter(adapter);

        spBusSelect.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                if (position < activeTrips.size()) {
                    selectedTrip = activeTrips.get(position);
                    updateTripDisplay(selectedTrip);
                    SocketManager.getInstance().trackBus(selectedTrip.getBusId());
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });
    }

    private void updateTripDisplay(Trip trip) {
        tvBusNumber.setText(trip.getBusNumber() + " (" + trip.getLicensePlate() + ")");
        tvBusRoute.setText(trip.getRouteName());
        double speed = trip.getCurrentSpeed() != null ? trip.getCurrentSpeed() : 38.0;
        tvSpeedBadge.setText(String.format("%.0f km/h", speed));

        double lat = trip.getCurrentLatitude() != null ? trip.getCurrentLatitude() : 12.9782;
        double lng = trip.getCurrentLongitude() != null ? trip.getCurrentLongitude() : 77.6012;
        updateMapMarker(lat, lng, trip.getBusNumber(), speed);
    }

    private void setupSocketListener() {
        SocketManager.getInstance().connect();
        SocketManager.getInstance().setLocationListener(new SocketManager.LocationListener() {
            @Override
            public void onLocationReceived(LocationUpdate update) {
                if (getActivity() == null) return;
                getActivity().runOnUiThread(() -> {
                    if (selectedTrip == null || selectedTrip.getBusId() == update.getBusId()) {
                        tvSpeedBadge.setText(String.format("%.0f km/h", update.getSpeed()));
                        tvLiveCoords.setText(String.format("GPS: %.4f° N, %.4f° E", update.getLatitude(), update.getLongitude()));
                        tvLiveTelemetrySpeed.setText(String.format("Current Velocity: %.1f km/h", update.getSpeed()));
                        updateMapMarker(update.getLatitude(), update.getLongitude(), "BUS-" + update.getBusId(), update.getSpeed());
                    }
                });
            }
        });
    }

    private void updateMapMarker(double lat, double lng, String title, double speed) {
        LatLng position = new LatLng(lat, lng);
        if (googleMap != null) {
            if (busMarker == null) {
                busMarker = googleMap.addMarker(new MarkerOptions()
                        .position(position)
                        .title(title)
                        .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_GREEN)));
            } else {
                busMarker.setPosition(position);
                busMarker.setTitle(title);
            }
            googleMap.animateCamera(CameraUpdateFactory.newLatLngZoom(position, 15f));
        } else {
            telemetryFallback.setVisibility(View.VISIBLE);
        }
    }

    @Override
    public void onMapReady(@NonNull GoogleMap map) {
        this.googleMap = map;
        googleMap.getUiSettings().setZoomControlsEnabled(true);
        LatLng campus = new LatLng(12.9782, 77.6012);
        googleMap.moveCamera(CameraUpdateFactory.newLatLngZoom(campus, 13f));
    }
}
