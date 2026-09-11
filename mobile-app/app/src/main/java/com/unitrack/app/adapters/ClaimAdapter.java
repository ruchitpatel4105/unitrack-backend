package com.unitrack.app.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.unitrack.app.R;
import com.unitrack.app.models.Claim;
import java.util.ArrayList;
import java.util.List;

public class ClaimAdapter extends RecyclerView.Adapter<ClaimAdapter.ClaimViewHolder> {
    private List<Claim> claims = new ArrayList<>();

    public void setClaims(List<Claim> claims) {
        this.claims = claims != null ? claims : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ClaimViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_claim, parent, false);
        return new ClaimViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ClaimViewHolder holder, int position) {
        Claim claim = claims.get(position);
        holder.tvTitle.setText(claim.getItemTitle() != null ? claim.getItemTitle() : "Claimed Item #" + claim.getItemId());
        holder.tvProof.setText(claim.getProofDescription());
        holder.tvStatus.setText(claim.getStatus() != null ? claim.getStatus().toUpperCase() : "PENDING");

        if ("approved".equalsIgnoreCase(claim.getStatus())) {
            holder.tvStatus.setBackgroundResource(R.drawable.bg_badge_emerald);
            holder.tvStatus.setTextColor(holder.itemView.getContext().getResources().getColor(R.color.primary_dark));
        } else if ("rejected".equalsIgnoreCase(claim.getStatus())) {
            holder.tvStatus.setBackgroundResource(R.drawable.bg_badge_rose);
            holder.tvStatus.setTextColor(holder.itemView.getContext().getResources().getColor(R.color.danger_dark));
        } else {
            holder.tvStatus.setBackgroundResource(R.drawable.bg_badge_amber);
            holder.tvStatus.setTextColor(holder.itemView.getContext().getResources().getColor(R.color.warning));
        }

        if (claim.getAdminNotes() != null && !claim.getAdminNotes().isEmpty()) {
            holder.tvNotes.setText("Admin Note: " + claim.getAdminNotes());
            holder.tvNotes.setVisibility(View.VISIBLE);
        } else {
            holder.tvNotes.setVisibility(View.GONE);
        }
    }

    @Override
    public int getItemCount() {
        return claims.size();
    }

    static class ClaimViewHolder extends RecyclerView.ViewHolder {
        TextView tvTitle, tvProof, tvStatus, tvNotes;

        ClaimViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvClaimItemTitle);
            tvProof = itemView.findViewById(R.id.tvClaimProof);
            tvStatus = itemView.findViewById(R.id.tvClaimStatus);
            tvNotes = itemView.findViewById(R.id.tvAdminNotes);
        }
    }
}
