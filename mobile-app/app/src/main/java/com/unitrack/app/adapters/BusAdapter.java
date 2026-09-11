package com.unitrack.app.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.unitrack.app.R;
import com.unitrack.app.models.Bus;
import java.util.ArrayList;
import java.util.List;

public class BusAdapter extends RecyclerView.Adapter<BusAdapter.BusViewHolder> {

    public interface OnBusClickListener {
        void onBusClick(Bus bus);
    }

    private List<Bus> buses = new ArrayList<>();
    private final OnBusClickListener listener;

    public BusAdapter(OnBusClickListener listener) {
        this.listener = listener;
    }

    public void setBuses(List<Bus> buses) {
        this.buses = buses != null ? buses : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public BusViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_bus, parent, false);
        return new BusViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull BusViewHolder holder, int position) {
        Bus bus = buses.get(position);
        holder.tvNumber.setText(bus.getBusNumber() + " (" + bus.getLicensePlate() + ")");
        holder.tvStatus.setText(bus.getStatus() != null ? bus.getStatus().toUpperCase() : "ACTIVE");
        holder.tvRoute.setText("Route: " + (bus.getRouteName() != null ? bus.getRouteName() : "Unassigned"));
        holder.tvDriver.setText("Driver: " + (bus.getDriverName() != null ? bus.getDriverName() : "Unassigned"));

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) listener.onBusClick(bus);
        });
    }

    @Override
    public int getItemCount() {
        return buses.size();
    }

    static class BusViewHolder extends RecyclerView.ViewHolder {
        TextView tvNumber, tvStatus, tvRoute, tvDriver;

        BusViewHolder(@NonNull View itemView) {
            super(itemView);
            tvNumber = itemView.findViewById(R.id.tvBusCardNumber);
            tvStatus = itemView.findViewById(R.id.tvBusCardStatus);
            tvRoute = itemView.findViewById(R.id.tvBusCardRoute);
            tvDriver = itemView.findViewById(R.id.tvBusCardDriver);
        }
    }
}
