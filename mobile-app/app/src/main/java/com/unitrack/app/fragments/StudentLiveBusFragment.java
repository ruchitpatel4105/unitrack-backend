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
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.unitrack.app.R;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.LocationUpdate;
import com.unitrack.app.models.Trip;
import com.unitrack.app.network.ApiClient;
import com.unitrack.app.socket.SocketManager;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class StudentLiveBusFragment extends Fragment {

    private WebView mapWebView;
    private TextView tvBusNumber, tvBusRoute, tvSpeedBadge, tvEta, tvLiveCoords, tvLiveTelemetrySpeed;
    private View telemetryFallback;
    private Spinner spBusSelect;
    private List<Trip> activeTrips = new ArrayList<>();
    private Trip selectedTrip;
    private boolean isMapLoaded = false;

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

        // Initialize OpenStreetMap Leaflet WebView
        mapWebView = view.findViewById(R.id.mapWebView);
        if (mapWebView != null) {
            WebSettings settings = mapWebView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setAllowFileAccess(true);
            settings.setLoadWithOverviewMode(true);
            settings.setUseWideViewPort(true);

            mapWebView.setWebViewClient(new WebViewClient() {
                @Override
                public void onPageFinished(WebView view, String url) {
                    super.onPageFinished(view, url);
                    isMapLoaded = true;
                    if (selectedTrip != null) {
                        renderTripOnMap(selectedTrip);
                    }
                }
            });

            mapWebView.loadUrl("file:///android_asset/map.html");
        }

        fetchActiveTrips();
        setupSocketListener();

        return view;
    }

    private void fetchActiveTrips() {
        ApiClient.getService(requireContext()).getActiveTrips().enqueue(new Callback<ApiResponse<List<Trip>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Trip>>> call, Response<ApiResponse<List<Trip>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null && !response.body().getData().isEmpty()) {
                    activeTrips = response.body().getData();
                    setupSpinner();
                } else {
                    displayNoActiveTrips();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Trip>>> call, Throwable t) {
                displayNoActiveTrips();
            }
        });
    }

    private void displayNoActiveTrips() {
        if (!isAdded() || getContext() == null) return;
        tvBusNumber.setText("No Active Trips Running");
        tvBusRoute.setText("All campus buses are currently stationed at Parul Campus Depot");
        tvSpeedBadge.setText("0 km/h • Depot");
        tvEta.setText("Depot • Standing by for Driver");
        tvLiveCoords.setText("GPS: 22.2887° N, 73.3634° E (Campus Depot)");
        tvLiveTelemetrySpeed.setText("Status: Stationed at Depot");

        List<String> labels = new ArrayList<>();
        labels.add("No Active Trips (Buses at Campus Depot)");
        ArrayAdapter<String> adapter = new ArrayAdapter<>(requireContext(), android.R.layout.simple_spinner_dropdown_item, labels);
        spBusSelect.setAdapter(adapter);

        if (mapWebView != null && isMapLoaded) {
            mapWebView.evaluateJavascript("window.clearBuses(); window.centerOnCampus();", null);
        }
    }

    private void setupSpinner() {
        if (!isAdded() || getContext() == null) return;
        if (activeTrips == null || activeTrips.isEmpty()) {
            displayNoActiveTrips();
            return;
        }

        List<String> labels = new ArrayList<>();
        for (Trip t : activeTrips) {
            labels.add(t.getBusNumber() + " - " + t.getRouteName());
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
        double speed = trip.getCurrentSpeed() != null ? trip.getCurrentSpeed() : 0.0;
        tvSpeedBadge.setText(String.format(Locale.US, "%.0f km/h", speed));
        tvEta.setText("Live On Route • GPS Connected");

        renderTripOnMap(trip);
    }

    private void renderTripOnMap(Trip trip) {
        if (mapWebView == null || !isMapLoaded) return;
        double lat = trip.getCurrentLatitude() != null ? trip.getCurrentLatitude() : 22.2887;
        double lng = trip.getCurrentLongitude() != null ? trip.getCurrentLongitude() : 73.3634;
        double speed = trip.getCurrentSpeed() != null ? trip.getCurrentSpeed() : 0.0;
        double heading = trip.getCurrentHeading() != null ? trip.getCurrentHeading() : 0.0;

        String js = String.format(Locale.US,
                "window.updateBusLocation(%d, '%s', %f, %f, %f, %f);",
                trip.getBusId(), trip.getBusNumber(), lat, lng, speed, heading);
        mapWebView.evaluateJavascript(js, null);
    }

    private void setupSocketListener() {
        SocketManager.getInstance().connect();
        SocketManager.getInstance().setLocationListener(new SocketManager.LocationListener() {
            @Override
            public void onLocationReceived(LocationUpdate update) {
                if (getActivity() == null) return;
                getActivity().runOnUiThread(() -> {
                    if (selectedTrip == null || selectedTrip.getBusId() == update.getBusId()) {
                        tvSpeedBadge.setText(String.format(Locale.US, "%.0f km/h", update.getSpeed()));
                        tvLiveCoords.setText(String.format(Locale.US, "GPS: %.4f° N, %.4f° E", update.getLatitude(), update.getLongitude()));
                        tvLiveTelemetrySpeed.setText(String.format(Locale.US, "Current Velocity: %.1f km/h", update.getSpeed()));

                        if (mapWebView != null && isMapLoaded) {
                            String busLabel = (selectedTrip != null) ? selectedTrip.getBusNumber() : ("BUS-" + update.getBusId());
                            String js = String.format(Locale.US,
                                    "window.updateBusLocation(%d, '%s', %f, %f, %f, %f);",
                                    update.getBusId(), busLabel, update.getLatitude(), update.getLongitude(), update.getSpeed(), update.getHeading());
                            mapWebView.evaluateJavascript(js, null);
                        }
                    }
                });
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        if (mapWebView != null) {
            mapWebView.destroy();
        }
    }
}
