package com.unitrack.app.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;
import com.unitrack.app.R;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.LocationUpdate;
import com.unitrack.app.models.Trip;
import com.unitrack.app.network.ApiClient;
import com.unitrack.app.socket.SocketManager;
import java.util.List;
import java.util.Locale;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LiveBusActivity extends AppCompatActivity {

    private WebView mapWebView;
    private TextView tvLiveStatus, tvSpeedBadge, tvRouteName, tvDriverInfo, tvCoordinates;
    private View telemetryOverlay;
    private int busId = 1;
    private String currentBusNumber = "1";
    private boolean isMapLoaded = false;
    private Trip activeTrip = null;

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

        mapWebView = findViewById(R.id.mapWebView);
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
                    if (activeTrip != null) {
                        renderBusPosition(activeTrip.getCurrentLatitude(), activeTrip.getCurrentLongitude(), activeTrip.getBusNumber(), activeTrip.getCurrentSpeed(), activeTrip.getCurrentHeading());
                    }
                }
            });

            mapWebView.loadUrl("file:///android_asset/map.html");
        }

        fetchActiveTrip();
        setupLiveSocket();
    }

    private void fetchActiveTrip() {
        ApiClient.getService(this).getActiveTrips().enqueue(new Callback<ApiResponse<List<Trip>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Trip>>> call, Response<ApiResponse<List<Trip>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null && !response.body().getData().isEmpty()) {
                    activeTrip = response.body().getData().get(0);
                    busId = activeTrip.getBusId();
                    currentBusNumber = activeTrip.getBusNumber();
                    tvRouteName.setText(activeTrip.getRouteName());
                    tvDriverInfo.setText("Driver: " + activeTrip.getDriverName() + " • Bus: " + activeTrip.getBusNumber());
                    double speed = activeTrip.getCurrentSpeed() != null ? activeTrip.getCurrentSpeed() : 0.0;
                    tvSpeedBadge.setText(String.format(Locale.US, "%.0f km/h", speed));
                    tvLiveStatus.setText("Live Trip in Progress");

                    double lat = activeTrip.getCurrentLatitude() != null ? activeTrip.getCurrentLatitude() : 22.2887;
                    double lng = activeTrip.getCurrentLongitude() != null ? activeTrip.getCurrentLongitude() : 73.3634;
                    renderBusPosition(lat, lng, activeTrip.getBusNumber(), speed, activeTrip.getCurrentHeading());

                    SocketManager.getInstance().trackBus(busId);
                } else {
                    displayDepotStandby();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Trip>>> call, Throwable t) {
                displayDepotStandby();
            }
        });
    }

    private void displayDepotStandby() {
        tvLiveStatus.setText("Campus Standby • No Active Trips");
        tvSpeedBadge.setText("0 km/h");
        tvRouteName.setText("Campus Transit Depot");
        tvDriverInfo.setText("Status: Stationed at Parul Campus Depot");
        tvCoordinates.setText("GPS: 22.2887° N, 73.3634° E (Campus Depot)");

        if (mapWebView != null && isMapLoaded) {
            mapWebView.evaluateJavascript("window.clearBuses(); window.centerOnCampus();", null);
        }
    }

    private void setupLiveSocket() {
        SocketManager.getInstance().connect();
        SocketManager.getInstance().trackBus(busId);

        SocketManager.getInstance().setLocationListener(new SocketManager.LocationListener() {
            @Override
            public void onLocationReceived(LocationUpdate update) {
                runOnUiThread(() -> {
                    tvLiveStatus.setText("Live GPS Streaming Active");
                    tvSpeedBadge.setText(String.format(Locale.US, "%.0f km/h", update.getSpeed()));
                    tvCoordinates.setText(String.format(Locale.US, "GPS: %.4f° N, %.4f° E", update.getLatitude(), update.getLongitude()));
                    renderBusPosition(update.getLatitude(), update.getLongitude(), currentBusNumber, update.getSpeed(), update.getHeading());
                });
            }
        });
    }

    private void renderBusPosition(Double lat, Double lng, String busTitle, Double speed, Double heading) {
        if (mapWebView == null || !isMapLoaded) return;
        double actualLat = lat != null ? lat : 22.2887;
        double actualLng = lng != null ? lng : 73.3634;
        double actualSpeed = speed != null ? speed : 0.0;
        double actualHeading = heading != null ? heading : 0.0;

        String js = String.format(Locale.US,
                "window.updateBusLocation(%d, '%s', %f, %f, %f, %f);",
                busId, busTitle != null ? busTitle : ("Bus " + busId), actualLat, actualLng, actualSpeed, actualHeading);
        mapWebView.evaluateJavascript(js, null);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (mapWebView != null) {
            mapWebView.destroy();
        }
    }
}
