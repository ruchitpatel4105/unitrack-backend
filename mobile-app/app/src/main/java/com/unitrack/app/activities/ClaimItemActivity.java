package com.unitrack.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.unitrack.app.R;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.network.ApiClient;
import com.unitrack.app.utils.Constants;
import java.util.HashMap;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ClaimItemActivity extends AppCompatActivity {

    private ImageView btnBack;
    private TextInputEditText etProof;
    private MaterialButton btnSubmitClaim;
    private ProgressBar claimProgressBar;
    private int itemId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_claim_item);

        btnBack = findViewById(R.id.btnBack);
        etProof = findViewById(R.id.etProof);
        btnSubmitClaim = findViewById(R.id.btnSubmitClaim);
        claimProgressBar = findViewById(R.id.claimProgressBar);

        itemId = getIntent().getIntExtra(Constants.EXTRA_ITEM_ID, -1);
        if (itemId <= 0) {
            Toast.makeText(this, "Item identifier missing.", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        btnBack.setOnClickListener(v -> finish());
        btnSubmitClaim.setOnClickListener(v -> submitClaim());
    }

    private void submitClaim() {
        String proofText = etProof.getText() != null ? etProof.getText().toString().trim() : "";
        if (TextUtils.isEmpty(proofText)) {
            etProof.setError("Please describe proof of ownership");
            etProof.requestFocus();
            return;
        }

        btnSubmitClaim.setEnabled(false);
        claimProgressBar.setVisibility(View.VISIBLE);

        Map<String, Object> body = new HashMap<>();
        body.put("item_id", itemId);
        body.put("proof_description", proofText);

        ApiClient.getService(this).submitClaim(body).enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
            @Override
            public void onResponse(Call<ApiResponse<Map<String, Object>>> call, Response<ApiResponse<Map<String, Object>>> response) {
                claimProgressBar.setVisibility(View.GONE);
                btnSubmitClaim.setEnabled(true);

                if (response.isSuccessful()) {
                    Toast.makeText(ClaimItemActivity.this, "Claim filed successfully! Campus admin will review your proof.", Toast.LENGTH_LONG).show();
                    Intent intent = new Intent(ClaimItemActivity.this, ClaimStatusActivity.class);
                    startActivity(intent);
                    finish();
                } else {
                    Toast.makeText(ClaimItemActivity.this, "Failed to submit claim. You may have already claimed this item.", Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Map<String, Object>>> call, Throwable t) {
                claimProgressBar.setVisibility(View.GONE);
                btnSubmitClaim.setEnabled(true);
                Toast.makeText(ClaimItemActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
