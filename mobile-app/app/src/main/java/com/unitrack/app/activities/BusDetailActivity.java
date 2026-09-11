package com.unitrack.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import com.unitrack.app.R;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.Bus;
import com.unitrack.app.network.ApiClient;
import com.unitrack.app.utils.Constants;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class BusDetailActivity extends AppCompatActivity {

    private TextView tvNumber, tvPlate, tvModel, tvCapacity, tvDriver, tvRoute;
    private Bus bus;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_bus_detail);

        findViewById(R.id.btnBack).setOnClickListener(v -> finish());

        tvNumber = findViewById(R.id.tvBusNumber);
        tvPlate = findViewById(R.id.tvLicensePlate);
        tvModel = findViewById(R.id.tvModel);
        tvCapacity = findViewById(R.id.tvCapacity);
        tvDriver = findViewById(R.id.tvDriver);
        tvRoute = findViewById(R.id.tvAssignedRoute);

        bus = (Bus) getIntent().getSerializableExtra(Constants.EXTRA_BUS);
        int busId = getIntent().getIntExtra(Constants.EXTRA_BUS_ID, 1);

        if (bus != null) {
            displayBus(bus);
        } else {
            fetchBus(busId);
        }

        findViewById(R.id.btnViewOnMap).setOnClickListener(v -> {
            Intent intent = new Intent(this, LiveBusActivity.class);
            if (bus != null) intent.putExtra(Constants.EXTRA_BUS_ID, bus.getId());
            startActivity(intent);
        });
    }

    private void displayBus(Bus b) {
        this.bus = b;
        tvNumber.setText(b.getBusNumber());
        tvPlate.setText("Plate: " + b.getLicensePlate());
        tvModel.setText("Model: " + b.getModel());
        tvCapacity.setText("Seating Capacity: " + b.getCapacity() + " Passengers");
        tvDriver.setText("Assigned Driver: " + (b.getDriverName() != null ? b.getDriverName() : "Unassigned"));
        tvRoute.setText("Route: " + (b.getRouteName() != null ? b.getRouteName() : "Unassigned"));
    }

    private void fetchBus(int id) {
        ApiClient.getService(this).getBusById(id).enqueue(new Callback<ApiResponse<Bus>>() {
            @Override
            public void onResponse(Call<ApiResponse<Bus>> call, Response<ApiResponse<Bus>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    displayBus(response.body().getData());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Bus>> call, Throwable t) {}
        });
    }
}
