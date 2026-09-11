package com.unitrack.app.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.unitrack.app.R;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.Trip;
import com.unitrack.app.network.ApiClient;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DriverBusFragment extends Fragment {

    private TextView tvBusNum, tvBusPlate, tvBusModel, tvBusCapacity, tvBusHealth;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_driver_bus, container, false);

        tvBusNum = view.findViewById(R.id.tvBusNum);
        tvBusPlate = view.findViewById(R.id.tvBusPlate);
        tvBusModel = view.findViewById(R.id.tvBusModel);
        tvBusCapacity = view.findViewById(R.id.tvBusCapacity);
        tvBusHealth = view.findViewById(R.id.tvBusHealth);

        ApiClient.getService(requireContext()).getDriverCurrentTrip().enqueue(new Callback<ApiResponse<Trip>>() {
            @Override
            public void onResponse(Call<ApiResponse<Trip>> call, Response<ApiResponse<Trip>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    Trip trip = response.body().getData();
                    tvBusNum.setText(trip.getBusNumber());
                    tvBusPlate.setText(trip.getLicensePlate());
                    if (trip.getBusModel() != null) tvBusModel.setText("Model: " + trip.getBusModel());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Trip>> call, Throwable t) {}
        });

        return view;
    }
}
