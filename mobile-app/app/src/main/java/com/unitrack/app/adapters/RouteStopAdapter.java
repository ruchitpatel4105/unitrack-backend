package com.unitrack.app.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.unitrack.app.R;
import com.unitrack.app.models.RouteStop;
import java.util.ArrayList;
import java.util.List;

public class RouteStopAdapter extends RecyclerView.Adapter<RouteStopAdapter.StopViewHolder> {
    private List<RouteStop> stops = new ArrayList<>();

    public void setStops(List<RouteStop> stops) {
        this.stops = stops != null ? stops : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public StopViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_route_stop, parent, false);
        return new StopViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull StopViewHolder holder, int position) {
        RouteStop stop = stops.get(position);
        holder.tvOrder.setText(String.valueOf(stop.getStopOrder()));
        holder.tvName.setText(stop.getStopName());
        holder.tvCoords.setText(String.format("%.4f, %.4f", stop.getLatitude(), stop.getLongitude()));
        holder.tvOffset.setText("+" + stop.getEstimatedTimeOffsetMins() + " min");
    }

    @Override
    public int getItemCount() {
        return stops.size();
    }

    static class StopViewHolder extends RecyclerView.ViewHolder {
        TextView tvOrder, tvName, tvCoords, tvOffset;

        StopViewHolder(@NonNull View itemView) {
            super(itemView);
            tvOrder = itemView.findViewById(R.id.tvStopOrder);
            tvName = itemView.findViewById(R.id.tvStopName);
            tvCoords = itemView.findViewById(R.id.tvStopCoordinates);
            tvOffset = itemView.findViewById(R.id.tvStopOffset);
        }
    }
}
