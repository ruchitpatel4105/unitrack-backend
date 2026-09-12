package com.unitrack.app.fragments;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.unitrack.app.R;
import com.unitrack.app.activities.ClaimStatusActivity;
import com.unitrack.app.activities.ItemDetailActivity;
import com.unitrack.app.activities.ReportFoundItemActivity;
import com.unitrack.app.activities.ReportLostItemActivity;
import com.unitrack.app.adapters.LostFoundItemAdapter;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.LostFoundItem;
import com.unitrack.app.network.ApiClient;
import com.unitrack.app.utils.Constants;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class StudentLostFoundFragment extends Fragment {

    private RecyclerView rvItems;
    private SwipeRefreshLayout swipeRefresh;
    private LostFoundItemAdapter adapter;
    private String currentFilter = null; // null = all

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_student_lost_found, container, false);

        rvItems = view.findViewById(R.id.rvLostFound);
        swipeRefresh = view.findViewById(R.id.swipeRefreshLostFound);

        rvItems.setLayoutManager(new LinearLayoutManager(requireContext()));
        adapter = new LostFoundItemAdapter(item -> {
            Intent intent = new Intent(requireContext(), ItemDetailActivity.class);
            intent.putExtra(Constants.EXTRA_ITEM, item);
            intent.putExtra(Constants.EXTRA_ITEM_ID, item.getId());
            startActivity(intent);
        });
        rvItems.setAdapter(adapter);

        // Filter buttons
        view.findViewById(R.id.btnAllItems).setOnClickListener(v -> {
            currentFilter = null;
            fetchItems();
        });
        view.findViewById(R.id.btnLostItems).setOnClickListener(v -> {
            currentFilter = "lost";
            fetchItems();
        });
        view.findViewById(R.id.btnFoundItems).setOnClickListener(v -> {
            currentFilter = "found";
            fetchItems();
        });

        // Bottom action buttons
        view.findViewById(R.id.btnReportLostItem).setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), ReportLostItemActivity.class));
        });
        view.findViewById(R.id.btnReportFoundItem).setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), ReportFoundItemActivity.class));
        });

        // Claims history icon
        view.findViewById(R.id.btnMyClaimsHistory).setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), ClaimStatusActivity.class));
        });

        swipeRefresh.setOnRefreshListener(this::fetchItems);
        return view;
    }

    private void fetchItems() {
        if (!isAdded() || getContext() == null) return;
        swipeRefresh.setRefreshing(true);
        ApiClient.getService(requireContext()).getLostFoundItems(currentFilter, null, null).enqueue(new Callback<ApiResponse<List<LostFoundItem>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<LostFoundItem>>> call, Response<ApiResponse<List<LostFoundItem>>> response) {
                if (!isAdded() || getContext() == null) return;
                swipeRefresh.setRefreshing(false);
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    adapter.setItems(response.body().getData());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<LostFoundItem>>> call, Throwable t) {
                if (!isAdded() || getContext() == null) return;
                swipeRefresh.setRefreshing(false);
                android.widget.Toast.makeText(getContext(), "Connecting to cloud... Pull down to refresh", android.widget.Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        fetchItems();
    }
}
