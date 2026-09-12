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
import com.unitrack.app.activities.RouteDetailActivity;
import com.unitrack.app.adapters.RouteAdapter;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.Route;
import com.unitrack.app.network.ApiClient;
import com.unitrack.app.utils.Constants;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class StudentRoutesFragment extends Fragment {

    private RecyclerView rvRoutes;
    private SwipeRefreshLayout swipeRefresh;
    private RouteAdapter adapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_student_routes, container, false);

        rvRoutes = view.findViewById(R.id.rvRoutes);
        swipeRefresh = view.findViewById(R.id.swipeRefreshRoutes);

        rvRoutes.setLayoutManager(new LinearLayoutManager(requireContext()));
        adapter = new RouteAdapter(route -> {
            Intent intent = new Intent(requireContext(), RouteDetailActivity.class);
            intent.putExtra(Constants.EXTRA_ROUTE, route);
            intent.putExtra(Constants.EXTRA_ROUTE_ID, route.getId());
            startActivity(intent);
        });
        rvRoutes.setAdapter(adapter);

        swipeRefresh.setOnRefreshListener(this::fetchRoutes);
        fetchRoutes();

        return view;
    }

    private void fetchRoutes() {
        if (!isAdded() || getContext() == null) return;
        swipeRefresh.setRefreshing(true);
        ApiClient.getService(requireContext()).getAllRoutes().enqueue(new Callback<ApiResponse<List<Route>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Route>>> call, Response<ApiResponse<List<Route>>> response) {
                if (!isAdded() || getContext() == null) return;
                swipeRefresh.setRefreshing(false);
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    adapter.setRoutes(response.body().getData());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Route>>> call, Throwable t) {
                if (!isAdded() || getContext() == null) return;
                swipeRefresh.setRefreshing(false);
                android.widget.Toast.makeText(getContext(), "Connecting to cloud... Pull down to refresh", android.widget.Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        fetchRoutes();
    }
}
