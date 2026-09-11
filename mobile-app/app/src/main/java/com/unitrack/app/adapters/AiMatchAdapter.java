package com.unitrack.app.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.unitrack.app.R;
import com.unitrack.app.models.AiMatch;
import java.util.ArrayList;
import java.util.List;

public class AiMatchAdapter extends RecyclerView.Adapter<AiMatchAdapter.MatchViewHolder> {

    public interface OnMatchClickListener {
        void onMatchClick(AiMatch match);
    }

    private List<AiMatch> matches = new ArrayList<>();
    private final OnMatchClickListener listener;

    public AiMatchAdapter(OnMatchClickListener listener) {
        this.listener = listener;
    }

    public void setMatches(List<AiMatch> matches) {
        this.matches = matches != null ? matches : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public MatchViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_ai_match, parent, false);
        return new MatchViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull MatchViewHolder holder, int position) {
        AiMatch match = matches.get(position);
        holder.tvTitle.setText(match.getMatchedTitle() != null ? match.getMatchedTitle() : "Suggested Item Match");
        holder.tvScore.setText(String.format("%.1f%% MATCH", match.getMatchScore()));
        holder.tvReasons.setText(match.getMatchReasons());

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) listener.onMatchClick(match);
        });
    }

    @Override
    public int getItemCount() {
        return matches.size();
    }

    static class MatchViewHolder extends RecyclerView.ViewHolder {
        TextView tvTitle, tvScore, tvReasons;

        MatchViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvMatchTitle);
            tvScore = itemView.findViewById(R.id.tvMatchScore);
            tvReasons = itemView.findViewById(R.id.tvMatchReasons);
        }
    }
}
