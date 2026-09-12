package com.unitrack.app.activities;

import android.content.Intent;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.unitrack.app.R;
import com.unitrack.app.adapters.LostFoundItemAdapter;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.LostFoundItem;
import com.unitrack.app.network.ApiClient;
import com.unitrack.app.utils.Constants;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LostFoundListActivity extends AppCompatActivity {

    private RecyclerView rvItems;
    private SwipeRefreshLayout swipeRefresh;
    private LostFoundItemAdapter adapter;
    private String currentFilter = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_lost_found_list);

        findViewById(R.id.btnBack).setOnClickListener(v -> finish());

        rvItems = findViewById(R.id.rvItems);
        swipeRefresh = findViewById(R.id.swipeRefresh);

        rvItems.setLayoutManager(new LinearLayoutManager(this));
        adapter = new LostFoundItemAdapter(item -> {
            Intent intent = new Intent(this, ItemDetailActivity.class);
            intent.putExtra(Constants.EXTRA_ITEM, item);
            intent.putExtra(Constants.EXTRA_ITEM_ID, item.getId());
            startActivity(intent);
        });
        rvItems.setAdapter(adapter);

        findViewById(R.id.btnFilterAll).setOnClickListener(v -> {
            currentFilter = null;
            fetchItems();
        });
        findViewById(R.id.btnFilterLost).setOnClickListener(v -> {
            currentFilter = "lost";
            fetchItems();
        });
        findViewById(R.id.btnFilterFound).setOnClickListener(v -> {
            currentFilter = "found";
            fetchItems();
        });

        findViewById(R.id.btnReportLost).setOnClickListener(v -> {
            startActivity(new Intent(this, ReportLostItemActivity.class));
        });
        findViewById(R.id.btnReportFound).setOnClickListener(v -> {
            startActivity(new Intent(this, ReportFoundItemActivity.class));
        });

        findViewById(R.id.btnMyClaims).setOnClickListener(v -> {
            startActivity(new Intent(this, ClaimStatusActivity.class));
        });

        swipeRefresh.setOnRefreshListener(this::fetchItems);
    }

    private void fetchItems() {
        swipeRefresh.setRefreshing(true);
        ApiClient.getService(this).getLostFoundItems(currentFilter, null, null).enqueue(new Callback<ApiResponse<List<LostFoundItem>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<LostFoundItem>>> call, Response<ApiResponse<List<LostFoundItem>>> response) {
                swipeRefresh.setRefreshing(false);
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    adapter.setItems(response.body().getData());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<LostFoundItem>>> call, Throwable t) {
                swipeRefresh.setRefreshing(false);
                android.widget.Toast.makeText(LostFoundListActivity.this, "Connecting to cloud... Pull down to refresh", android.widget.Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        fetchItems();
    }
}
