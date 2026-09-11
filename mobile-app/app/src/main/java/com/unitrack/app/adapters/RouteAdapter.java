package com.unitrack.app.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;
import com.unitrack.app.R;
import com.unitrack.app.models.Route;
import java.util.ArrayList;
import java.util.List;

public class RouteAdapter extends RecyclerView.Adapter<RouteAdapter.RouteViewHolder> {

    public interface OnRouteClickListener {
        void onRouteClick(Route route);
    }

    private List<Route> routes = new ArrayList<>();
    private final OnRouteClickListener listener;

    public RouteAdapter(OnRouteClickListener listener) {
        this.listener = listener;
    }

    public void setRoutes(List<Route> routes) {
        this.routes = routes != null ? routes : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public RouteViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_route, parent, false);
        return new RouteViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull RouteViewHolder holder, int position) {
        Route route = routes.get(position);
        holder.tvCode.setText(route.getRouteCode());
        holder.tvName.setText(route.getRouteName());
        holder.tvDesc.setText(route.getDescription());
        holder.tvDuration.setText("⏱ " + route.getEstimatedDurationMins() + " mins");
        holder.tvDistance.setText("📍 " + route.getDistanceKm() + " km");

        if (route.getIsActive() == 1) {
            holder.tvStatus.setVisibility(View.VISIBLE);
            holder.tvStatus.setText("ACTIVE ROUTE");
            holder.tvStatus.setBackgroundResource(R.drawable.bg_badge_emerald);
            holder.tvStatus.setTextColor(ContextCompat.getColor(holder.itemView.getContext(), R.color.primary_dark));
        } else {
            holder.tvStatus.setVisibility(View.VISIBLE);
            holder.tvStatus.setText("INACTIVE");
            holder.tvStatus.setBackgroundResource(R.drawable.bg_badge_amber);
            holder.tvStatus.setTextColor(ContextCompat.getColor(holder.itemView.getContext(), R.color.accent));
        }

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) listener.onRouteClick(route);
        });
    }

    @Override
    public int getItemCount() {
        return routes.size();
    }

    static class RouteViewHolder extends RecyclerView.ViewHolder {
        TextView tvCode, tvName, tvDesc, tvDuration, tvDistance, tvStatus;

        RouteViewHolder(@NonNull View itemView) {
            super(itemView);
            tvCode = itemView.findViewById(R.id.tvItemRouteCode);
            tvName = itemView.findViewById(R.id.tvItemRouteName);
            tvDesc = itemView.findViewById(R.id.tvItemRouteDescription);
            tvDuration = itemView.findViewById(R.id.tvItemDuration);
            tvDistance = itemView.findViewById(R.id.tvItemDistance);
            tvStatus = itemView.findViewById(R.id.tvItemRouteStatus);
        }
    }
}
