package com.unitrack.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import com.bumptech.glide.Glide;
import com.unitrack.app.R;
import com.unitrack.app.models.AiMatch;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.LostFoundItem;
import com.unitrack.app.network.ApiClient;
import com.unitrack.app.utils.Constants;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ItemDetailActivity extends AppCompatActivity {

    private ImageView ivImage;
    private TextView tvType, tvCategory, tvTitle, tvDesc, tvLocation, tvDate, tvAiScore, tvAiReason;
    private View cardAiMatch;
    private Button btnClaim, btnViewAiMatch;
    private LostFoundItem item;
    private AiMatch topMatch;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_item_detail);

        findViewById(R.id.btnBack).setOnClickListener(v -> finish());

        ivImage = findViewById(R.id.ivItemImage);
        tvType = findViewById(R.id.tvItemType);
        tvCategory = findViewById(R.id.tvCategory);
        tvTitle = findViewById(R.id.tvItemTitle);
        tvDesc = findViewById(R.id.tvItemDesc);
        tvLocation = findViewById(R.id.tvLocation);
        tvDate = findViewById(R.id.tvDate);
        cardAiMatch = findViewById(R.id.cardAiMatch);
        tvAiScore = findViewById(R.id.tvAiScore);
        tvAiReason = findViewById(R.id.tvAiReason);
        btnClaim = findViewById(R.id.btnClaim);
        btnViewAiMatch = findViewById(R.id.btnViewAiMatch);

        item = (LostFoundItem) getIntent().getSerializableExtra(Constants.EXTRA_ITEM);
        int itemId = getIntent().getIntExtra(Constants.EXTRA_ITEM_ID, -1);

        if (item != null) {
            displayItem(item);
        } else if (itemId != -1) {
            fetchItem(itemId);
        } else {
            finish();
        }

        btnClaim.setOnClickListener(v -> {
            Intent intent = new Intent(this, ClaimItemActivity.class);
            if (item != null) intent.putExtra(Constants.EXTRA_ITEM_ID, item.getId());
            startActivity(intent);
        });

        btnViewAiMatch.setOnClickListener(v -> {
            Intent intent = new Intent(this, AiMatchDetailActivity.class);
            if (topMatch != null) intent.putExtra(Constants.EXTRA_AI_MATCH, topMatch);
            startActivity(intent);
        });
    }

    private void displayItem(LostFoundItem itm) {
        this.item = itm;
        tvTitle.setText(itm.getTitle());
        tvDesc.setText(itm.getDescription());
        tvCategory.setText(itm.getCategory() != null ? itm.getCategory().toUpperCase() : "GENERAL");
        tvLocation.setText("Location: " + itm.getLocationName());
        tvDate.setText("Date: " + itm.getItemDate());
        tvType.setText(itm.getType() != null ? itm.getType().toUpperCase() + " ITEM" : "ITEM");

        String resolvedUrl = Constants.resolveImageUrl(this, itm.getImageUrl());
        if (resolvedUrl != null && !resolvedUrl.isEmpty()) {
            Glide.with(this)
                    .load(resolvedUrl)
                    .placeholder(android.R.drawable.ic_menu_gallery)
                    .error(android.R.drawable.ic_menu_gallery)
                    .into(ivImage);
        }

        // AI Match display
        if (itm.getMatches() != null && !itm.getMatches().isEmpty()) {
            topMatch = itm.getMatches().get(0);
            tvAiScore.setText(String.format("%.1f%% MATCH", topMatch.getMatchScore()));
            tvAiReason.setText(topMatch.getMatchReasons());
            cardAiMatch.setVisibility(View.VISIBLE);
        } else {
            cardAiMatch.setVisibility(View.GONE);
        }

        // If it's a found item, allow claiming
        if ("found".equalsIgnoreCase(itm.getType())) {
            btnClaim.setVisibility(View.VISIBLE);
        } else {
            btnClaim.setVisibility(View.GONE);
        }
    }

    private void fetchItem(int id) {
        ApiClient.getService(this).getLostFoundItemById(id).enqueue(new Callback<ApiResponse<LostFoundItem>>() {
            @Override
            public void onResponse(Call<ApiResponse<LostFoundItem>> call, Response<ApiResponse<LostFoundItem>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    displayItem(response.body().getData());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<LostFoundItem>> call, Throwable t) {}
        });
    }
}
