package com.unitrack.app.activities;

import android.os.Bundle;
import android.widget.ImageView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.unitrack.app.R;
import com.unitrack.app.adapters.NotificationAdapter;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.NotificationItem;
import com.unitrack.app.network.ApiClient;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class NotificationsActivity extends AppCompatActivity {

    private ImageView btnBack;
    private SwipeRefreshLayout swipeRefreshNotifs;
    private RecyclerView rvNotifications;
    private NotificationAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_notifications);

        btnBack = findViewById(R.id.btnBack);
        swipeRefreshNotifs = findViewById(R.id.swipeRefreshNotifs);
        rvNotifications = findViewById(R.id.rvNotifications);

        btnBack.setOnClickListener(v -> finish());

        rvNotifications.setLayoutManager(new LinearLayoutManager(this));
        adapter = new NotificationAdapter();
        rvNotifications.setAdapter(adapter);

        swipeRefreshNotifs.setOnRefreshListener(this::loadNotifications);

        loadNotifications();
    }

    private void loadNotifications() {
        swipeRefreshNotifs.setRefreshing(true);
        ApiClient.getService(this).getNotifications().enqueue(new Callback<ApiResponse<List<NotificationItem>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<NotificationItem>>> call, Response<ApiResponse<List<NotificationItem>>> response) {
                swipeRefreshNotifs.setRefreshing(false);
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    List<NotificationItem> list = response.body().getData();
                    adapter.setNotifications(list);
                    if (list.isEmpty()) {
                        Toast.makeText(NotificationsActivity.this, "No new notifications.", Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Toast.makeText(NotificationsActivity.this, "Failed to load notifications", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<NotificationItem>>> call, Throwable t) {
                swipeRefreshNotifs.setRefreshing(false);
                Toast.makeText(NotificationsActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
