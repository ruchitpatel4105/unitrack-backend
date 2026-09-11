package com.unitrack.app.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.bumptech.glide.Glide;
import com.unitrack.app.R;
import com.unitrack.app.models.LostFoundItem;
import java.util.ArrayList;
import java.util.List;

public class LostFoundItemAdapter extends RecyclerView.Adapter<LostFoundItemAdapter.ItemViewHolder> {

    public interface OnItemClickListener {
        void onItemClick(LostFoundItem item);
    }

    private List<LostFoundItem> items = new ArrayList<>();
    private final OnItemClickListener listener;

    public LostFoundItemAdapter(OnItemClickListener listener) {
        this.listener = listener;
    }

    public void setItems(List<LostFoundItem> items) {
        this.items = items != null ? items : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ItemViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_lost_found, parent, false);
        return new ItemViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ItemViewHolder holder, int position) {
        LostFoundItem item = items.get(position);
        holder.tvTitle.setText(item.getTitle());
        holder.tvLocation.setText(item.getLocationName());
        holder.tvDate.setText(item.getItemDate());
        holder.tvBadge.setText(item.getType() != null ? item.getType().toUpperCase() : "ITEM");

        if ("lost".equalsIgnoreCase(item.getType())) {
            holder.tvBadge.setBackgroundResource(R.drawable.bg_badge_rose);
            holder.tvBadge.setTextColor(holder.itemView.getContext().getResources().getColor(R.color.danger_dark));
        } else {
            holder.tvBadge.setBackgroundResource(R.drawable.bg_badge_emerald);
            holder.tvBadge.setTextColor(holder.itemView.getContext().getResources().getColor(R.color.primary_dark));
        }

        String resolvedUrl = com.unitrack.app.utils.Constants.resolveImageUrl(holder.itemView.getContext(), item.getImageUrl());
        if (resolvedUrl != null && !resolvedUrl.isEmpty()) {
            Glide.with(holder.itemView.getContext())
                    .load(resolvedUrl)
                    .placeholder(android.R.drawable.ic_menu_gallery)
                    .error(android.R.drawable.ic_menu_gallery)
                    .into(holder.ivThumb);
        } else {
            holder.ivThumb.setImageResource(android.R.drawable.ic_menu_gallery);
        }

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) listener.onItemClick(item);
        });
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ItemViewHolder extends RecyclerView.ViewHolder {
        ImageView ivThumb;
        TextView tvBadge, tvTitle, tvLocation, tvDate;

        ItemViewHolder(@NonNull View itemView) {
            super(itemView);
            ivThumb = itemView.findViewById(R.id.ivItemThumb);
            tvBadge = itemView.findViewById(R.id.tvBadgeType);
            tvTitle = itemView.findViewById(R.id.tvItemTitle);
            tvLocation = itemView.findViewById(R.id.tvItemLocation);
            tvDate = itemView.findViewById(R.id.tvItemDate);
        }
    }
}
