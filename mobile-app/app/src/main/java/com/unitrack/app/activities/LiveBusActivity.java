package com.unitrack.app.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
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
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LiveBusActivity extends AppCompatActivity implements OnMapReadyCallback {

    private GoogleMap googleMap;
    private Marker busMarker;
    private TextView tvLiveStatus, tvSpeedBadge, tvRouteName, tvDriverInfo, tvCoordinates;
    private View telemetryOverlay;
    private int busId = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_live_bus);

        tvLiveStatus = findViewById(R.id.tvLiveStatus);
        tvSpeedBadge = findViewById(R.id.tvSpeedBadge);
        tvRouteName = findViewById(R.id.tvRouteName);
        tvDriverInfo = findViewById(R.id.tvDriverInfo);
        tvCoordinates = findViewById(R.id.tvCoordinates);
        telemetryOverlay = findViewById(R.id.telemetryOverlay);

        findViewById(R.id.btnBack).setOnClickListener(v -> finish());

        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager().findFragmentById(R.id.map);
        if (mapFragment != null) {
            mapFragment.getMapAsync(this);
        } else {
            telemetryOverlay.setVisibility(View.VISIBLE);
        }

        fetchActiveTrip();
        setupLiveSocket();
    }

    private void fetchActiveTrip() {
        ApiClient.getService(this).getActiveTrips().enqueue(new Callback<ApiResponse<List<Trip>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Trip>>> call, Response<ApiResponse<List<Trip>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null && !response.body().getData().isEmpty()) {
                    Trip trip = response.body().getData().get(0);
                    busId = trip.getBusId();
                    tvRouteName.setText(trip.getRouteName());
                    tvDriverInfo.setText("Driver: " + trip.getDriverName() + " • Bus: " + trip.getBusNumber());
                    double speed = trip.getCurrentSpeed() != null ? trip.getCurrentSpeed() : 38.0;
                    tvSpeedBadge.setText(String.format("%.0f km/h", speed));

                    double lat = trip.getCurrentLatitude() != null ? trip.getCurrentLatitude() : 12.9782;
                    double lng = trip.getCurrentLongitude() != null ? trip.getCurrentLongitude() : 77.6012;
                    updateBusPosition(lat, lng, trip.getBusNumber());

                    SocketManager.getInstance().trackBus(busId);
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Trip>>> call, Throwable t) {
                telemetryOverlay.setVisibility(View.VISIBLE);
            }
        });
    }

    private void setupLiveSocket() {
        SocketManager.getInstance().connect();
        SocketManager.getInstance().trackBus(busId);
        tvLiveStatus.setText("Socket.IO Telemetry Connected");

        SocketManager.getInstance().setLocationListener(new SocketManager.LocationListener() {
            @Override
            public void onLocationReceived(LocationUpdate update) {
                runOnUiThread(() -> {
                    tvSpeedBadge.setText(String.format("%.0f km/h", update.getSpeed()));
                    tvCoordinates.setText(String.format("GPS: %.4f° N, %.4f° E", update.getLatitude(), update.getLongitude()));
                    updateBusPosition(update.getLatitude(), update.getLongitude(), "BUS-" + update.getBusId());
                });
            }
        });
    }

    private void updateBusPosition(double lat, double lng, String busTitle) {
        LatLng latLng = new LatLng(lat, lng);
        if (googleMap != null) {
            if (busMarker == null) {
                busMarker = googleMap.addMarker(new MarkerOptions()
                        .position(latLng)
                        .title(busTitle)
                        .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_AZURE)));
            } else {
                busMarker.setPosition(latLng);
            }
            googleMap.animateCamera(CameraUpdateFactory.newLatLngZoom(latLng, 15f));
        } else {
            telemetryOverlay.setVisibility(View.VISIBLE);
        }
    }

    @Override
    public void onMapReady(@NonNull GoogleMap map) {
        this.googleMap = map;
        googleMap.getUiSettings().setZoomControlsEnabled(true);
        LatLng center = new LatLng(12.9782, 77.6012);
        googleMap.moveCamera(CameraUpdateFactory.newLatLngZoom(center, 13f));
    }
}
