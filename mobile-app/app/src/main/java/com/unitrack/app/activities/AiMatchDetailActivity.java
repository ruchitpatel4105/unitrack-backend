package com.unitrack.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.button.MaterialButton;
import com.unitrack.app.R;
import com.unitrack.app.models.AiMatch;
import com.unitrack.app.utils.Constants;

public class AiMatchDetailActivity extends AppCompatActivity {

    private ImageView btnBack;
    private TextView tvMatchPercentage;
    private TextView tvMatchExplanation;
    private MaterialButton btnProceedClaim;
    private AiMatch aiMatch;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_ai_match_detail);

        btnBack = findViewById(R.id.btnBack);
        tvMatchPercentage = findViewById(R.id.tvMatchPercentage);
        tvMatchExplanation = findViewById(R.id.tvMatchExplanation);
        btnProceedClaim = findViewById(R.id.btnProceedClaim);

        btnBack.setOnClickListener(v -> finish());

        aiMatch = (AiMatch) getIntent().getSerializableExtra(Constants.EXTRA_AI_MATCH);

        if (aiMatch != null) {
            displayAiMatch(aiMatch);
        } else {
            tvMatchPercentage.setText("—");
            tvMatchExplanation.setText("No AI match details available.");
            btnProceedClaim.setEnabled(false);
        }

        btnProceedClaim.setOnClickListener(v -> {
            Intent intent = new Intent(this, ClaimItemActivity.class);
            if (aiMatch != null) {
                intent.putExtra(Constants.EXTRA_ITEM_ID, aiMatch.getFoundItemId());
            }
            startActivity(intent);
        });
    }

    private void displayAiMatch(AiMatch match) {
        double score = match.getMatchScore();
        if (score <= 1.0) {
            // In case score is normalized (e.g. 0.94)
            score = score * 100;
        }
        tvMatchPercentage.setText(String.format("%.1f%%", score));

        if (match.getMatchReasons() != null && !match.getMatchReasons().isEmpty()) {
            tvMatchExplanation.setText(match.getMatchReasons());
        } else {
            tvMatchExplanation.setText("AI identified high feature similarity between your lost item report and the discovered transit property.");
        }
    }
}
