package com.unitrack.app.activities;

import android.content.Intent;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.unitrack.app.R;
import com.unitrack.app.adapters.RouteAdapter;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.Route;
import com.unitrack.app.network.ApiClient;
import com.unitrack.app.utils.Constants;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RouteListActivity extends AppCompatActivity {

    private RecyclerView rvRoutes;
    private SwipeRefreshLayout swipeRefresh;
    private RouteAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_route_list);

        findViewById(R.id.btnBack).setOnClickListener(v -> finish());

        rvRoutes = findViewById(R.id.rvRoutes);
        swipeRefresh = findViewById(R.id.swipeRefresh);

        rvRoutes.setLayoutManager(new LinearLayoutManager(this));
        adapter = new RouteAdapter(route -> {
            Intent intent = new Intent(this, RouteDetailActivity.class);
            intent.putExtra(Constants.EXTRA_ROUTE, route);
            intent.putExtra(Constants.EXTRA_ROUTE_ID, route.getId());
            startActivity(intent);
        });
        rvRoutes.setAdapter(adapter);

        swipeRefresh.setOnRefreshListener(this::fetchRoutes);
        fetchRoutes();
    }

    private void fetchRoutes() {
        swipeRefresh.setRefreshing(true);
        ApiClient.getService(this).getAllRoutes().enqueue(new Callback<ApiResponse<List<Route>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Route>>> call, Response<ApiResponse<List<Route>>> response) {
                swipeRefresh.setRefreshing(false);
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    adapter.setRoutes(response.body().getData());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Route>>> call, Throwable t) {
                swipeRefresh.setRefreshing(false);
            }
        });
    }
}
