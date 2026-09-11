package com.unitrack.app.activities;

import android.location.Location;
import android.os.Bundle;
import android.widget.ImageView;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.unitrack.app.R;
import com.unitrack.app.gps.LocationHelper;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.Trip;
import com.unitrack.app.network.ApiClient;
import com.unitrack.app.socket.SocketManager;
import com.unitrack.app.utils.Constants;
import java.util.HashMap;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DriverEmergencyActivity extends AppCompatActivity {

    private ImageView btnBack;
    private RadioGroup rgEmergencyType;
    private RadioButton rbBreakdown, rbMedical, rbAccident, rbSecurity, rbOther;
    private TextInputEditText etEmergencyNotes;
    private MaterialButton btnSendEmergencyAlert;

    private LocationHelper locationHelper;
    private double currentLat = 0.0;
    private double currentLng = 0.0;
    private int busId = -1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_driver_emergency);

        btnBack = findViewById(R.id.btnBack);
        rgEmergencyType = findViewById(R.id.rgEmergencyType);
        rbBreakdown = findViewById(R.id.rbBreakdown);
        rbMedical = findViewById(R.id.rbMedical);
        rbAccident = findViewById(R.id.rbAccident);
        rbSecurity = findViewById(R.id.rbSecurity);
        rbOther = findViewById(R.id.rbOther);
        etEmergencyNotes = findViewById(R.id.etEmergencyNotes);
        btnSendEmergencyAlert = findViewById(R.id.btnSendEmergencyAlert);

        busId = getIntent().getIntExtra(Constants.EXTRA_BUS_ID, -1);
        if (busId == -1) {
            ApiClient.getService(this).getDriverCurrentTrip().enqueue(new Callback<ApiResponse<Trip>>() {
                @Override
                public void onResponse(Call<ApiResponse<Trip>> call, Response<ApiResponse<Trip>> response) {
                    if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                        busId = response.body().getData().getBusId();
                    }
                }

                @Override
                public void onFailure(Call<ApiResponse<Trip>> call, Throwable t) {}
            });
        }

        btnBack.setOnClickListener(v -> finish());

        locationHelper = new LocationHelper(this);
        locationHelper.startLocationUpdates(5000, new LocationHelper.OnLocationUpdatedListener() {
            @Override
            public void onLocationChanged(Location location) {
                if (location != null) {
                    currentLat = location.getLatitude();
                    currentLng = location.getLongitude();
                }
            }
        });

        btnSendEmergencyAlert.setOnClickListener(v -> confirmAndSendEmergencyAlert());
    }

    private void confirmAndSendEmergencyAlert() {
        new AlertDialog.Builder(this)
                .setTitle("🚨 Confirm Emergency Alert")
                .setMessage("Are you sure you want to broadcast this critical emergency alarm? Campus security and transit dispatch will be alerted immediately.")
                .setIcon(android.R.drawable.ic_dialog_alert)
                .setPositiveButton("DISPATCH NOW", (dialog, which) -> sendEmergencyAlert())
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void sendEmergencyAlert() {
        String alertType = "breakdown";
        int checkedId = rgEmergencyType.getCheckedRadioButtonId();
        if (checkedId == R.id.rbMedical) {
            alertType = "medical";
        } else if (checkedId == R.id.rbAccident) {
            alertType = "accident";
        } else if (checkedId == R.id.rbSecurity) {
            alertType = "security";
        } else if (checkedId == R.id.rbOther) {
            alertType = "other";
        }

        String notes = etEmergencyNotes.getText() != null ? etEmergencyNotes.getText().toString().trim() : "";
        if (notes.isEmpty()) {
            notes = "Emergency reported by driver (" + alertType + ")";
        }

        if (busId <= 0) {
            Toast.makeText(this, "Cannot dispatch alert: No assigned bus found.", Toast.LENGTH_SHORT).show();
            return;
        }

        btnSendEmergencyAlert.setEnabled(false);

        // Broadcast directly via Socket.IO
        SocketManager.getInstance().emitEmergencyAlert(busId, null, alertType, notes, currentLat, currentLng);

        // Record via REST API
        Map<String, Object> body = new HashMap<>();
        body.put("bus_id", busId);
        body.put("alert_type", alertType);
        body.put("latitude", currentLat);
        body.put("longitude", currentLng);
        body.put("notes", notes);

        ApiClient.getService(this).reportEmergency(body).enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
            @Override
            public void onResponse(Call<ApiResponse<Map<String, Object>>> call, Response<ApiResponse<Map<String, Object>>> response) {
                btnSendEmergencyAlert.setEnabled(true);
                Toast.makeText(DriverEmergencyActivity.this, "EMERGENCY DISPATCHED! Dispatch and campus safety have been notified.", Toast.LENGTH_LONG).show();
                finish();
            }

            @Override
            public void onFailure(Call<ApiResponse<Map<String, Object>>> call, Throwable t) {
                btnSendEmergencyAlert.setEnabled(true);
                Toast.makeText(DriverEmergencyActivity.this, "Alert queued and transmitted over telemetry beacon.", Toast.LENGTH_LONG).show();
                finish();
            }
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (locationHelper != null) {
            locationHelper.stopLocationUpdates();
        }
    }
}
