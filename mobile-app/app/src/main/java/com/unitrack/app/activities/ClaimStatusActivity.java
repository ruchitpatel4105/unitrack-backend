package com.unitrack.app.activities;

import android.os.Bundle;
import android.widget.ImageView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.unitrack.app.R;
import com.unitrack.app.adapters.ClaimAdapter;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.Claim;
import com.unitrack.app.network.ApiClient;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ClaimStatusActivity extends AppCompatActivity {

    private ImageView btnBack;
    private SwipeRefreshLayout swipeRefreshClaims;
    private RecyclerView rvClaims;
    private ClaimAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_claim_status);

        btnBack = findViewById(R.id.btnBack);
        swipeRefreshClaims = findViewById(R.id.swipeRefreshClaims);
        rvClaims = findViewById(R.id.rvClaims);

        btnBack.setOnClickListener(v -> finish());

        rvClaims.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ClaimAdapter();
        rvClaims.setAdapter(adapter);

        swipeRefreshClaims.setOnRefreshListener(this::loadClaims);

        loadClaims();
    }

    private void loadClaims() {
        swipeRefreshClaims.setRefreshing(true);
        ApiClient.getService(this).getMyClaims().enqueue(new Callback<ApiResponse<List<Claim>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Claim>>> call, Response<ApiResponse<List<Claim>>> response) {
                swipeRefreshClaims.setRefreshing(false);
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    List<Claim> claims = response.body().getData();
                    adapter.setClaims(claims);
                    if (claims.isEmpty()) {
                        Toast.makeText(ClaimStatusActivity.this, "No submitted claims found.", Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Toast.makeText(ClaimStatusActivity.this, "Failed to load claims", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Claim>>> call, Throwable t) {
                swipeRefreshClaims.setRefreshing(false);
                Toast.makeText(ClaimStatusActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
