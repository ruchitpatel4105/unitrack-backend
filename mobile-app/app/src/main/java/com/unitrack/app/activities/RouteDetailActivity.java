package com.unitrack.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.unitrack.app.R;
import com.unitrack.app.adapters.RouteStopAdapter;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.Route;
import com.unitrack.app.network.ApiClient;
import com.unitrack.app.utils.Constants;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RouteDetailActivity extends AppCompatActivity {

    private TextView tvCode, tvName, tvDesc, tvDuration, tvDistance, tvRouteStatus;
    private RecyclerView rvStops;
    private RouteStopAdapter stopAdapter;
    private Route route;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_route_detail);

        findViewById(R.id.btnBack).setOnClickListener(v -> finish());

        tvCode = findViewById(R.id.tvRouteCode);
        tvName = findViewById(R.id.tvRouteName);
        tvRouteStatus = findViewById(R.id.tvRouteStatus);
        tvDesc = findViewById(R.id.tvRouteDesc);
        tvDuration = findViewById(R.id.tvDuration);
        tvDistance = findViewById(R.id.tvDistance);
        rvStops = findViewById(R.id.rvStops);

        rvStops.setLayoutManager(new LinearLayoutManager(this));
        stopAdapter = new RouteStopAdapter();
        rvStops.setAdapter(stopAdapter);

        findViewById(R.id.btnTrackLive).setOnClickListener(v -> {
            Intent intent = new Intent(this, LiveBusActivity.class);
            if (route != null) intent.putExtra(Constants.EXTRA_ROUTE_ID, route.getId());
            startActivity(intent);
        });

        route = (Route) getIntent().getSerializableExtra(Constants.EXTRA_ROUTE);
        int routeId = getIntent().getIntExtra(Constants.EXTRA_ROUTE_ID, -1);

        if (route != null) {
            displayRouteDetails(route);
        } else if (routeId != -1) {
            fetchRouteDetails(routeId);
        } else {
            finish();
        }
    }

    private void displayRouteDetails(Route r) {
        this.route = r;
        tvCode.setText(r.getRouteCode());
        tvName.setText(r.getRouteName());
        tvDesc.setText(r.getDescription());
        tvDuration.setText("Est. " + r.getEstimatedDurationMins() + " Mins");
        tvDistance.setText("Distance: " + r.getDistanceKm() + " km");

        if (tvRouteStatus != null) {
            if (r.getIsActive() == 1) {
                tvRouteStatus.setText("ACTIVE ROUTE");
                tvRouteStatus.setBackgroundResource(R.drawable.bg_badge_emerald);
                tvRouteStatus.setTextColor(androidx.core.content.ContextCompat.getColor(this, R.color.primary_dark));
            } else {
                tvRouteStatus.setText("INACTIVE");
                tvRouteStatus.setBackgroundResource(R.drawable.bg_badge_amber);
                tvRouteStatus.setTextColor(androidx.core.content.ContextCompat.getColor(this, R.color.accent));
            }
        }

        if (r.getStops() != null) {
            stopAdapter.setStops(r.getStops());
        }
    }

    private void fetchRouteDetails(int id) {
        ApiClient.getService(this).getRouteById(id).enqueue(new Callback<ApiResponse<Route>>() {
            @Override
            public void onResponse(Call<ApiResponse<Route>> call, Response<ApiResponse<Route>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    displayRouteDetails(response.body().getData());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Route>> call, Throwable t) {}
        });
    }
}
