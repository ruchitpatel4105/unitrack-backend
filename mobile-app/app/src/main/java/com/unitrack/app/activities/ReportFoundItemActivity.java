package com.unitrack.app.activities;

import android.app.TimePickerDialog;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import com.unitrack.app.R;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.Bus;
import com.unitrack.app.network.ApiClient;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ReportFoundItemActivity extends AppCompatActivity {

    private EditText etTitle, etColor, etLocation, etDescription, etSeatNumber, etTime;
    private Spinner spCategory, spBus, spSeatRow;
    private ImageView ivPreview;
    private TextView tvSelectPhoto;
    private ProgressBar progressBar;
    private List<Bus> availableBuses = new ArrayList<>();

    private String selectedImageBase64 = null;
    private ActivityResultLauncher<String> imagePickerLauncher;

    private static final String[] CATEGORIES = {"electronics", "documents", "accessories", "bags", "clothing", "other"};

    private static final String[] ROW_OPTIONS = {
            "Select Row (Optional)",
            "Row 1 (Front)",
            "Row 2",
            "Row 3",
            "Row 4",
            "Row 5",
            "Row 6",
            "Row 7",
            "Row 8",
            "Row 9",
            "Row 10",
            "Rear / Last Row",
            "Driver Side Seats",
            "Door / Conductor Side"
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_report_found_item);

        findViewById(R.id.btnBack).setOnClickListener(v -> finish());

        etTitle = findViewById(R.id.etFoundTitle);
        etColor = findViewById(R.id.etFoundColor);
        etLocation = findViewById(R.id.etFoundLocation);
        etDescription = findViewById(R.id.etFoundDescription);
        etSeatNumber = findViewById(R.id.etFoundSeatNumber);
        etTime = findViewById(R.id.etFoundTime);
        spCategory = findViewById(R.id.spFoundCategory);
        spBus = findViewById(R.id.spFoundBus);
        spSeatRow = findViewById(R.id.spFoundSeatRow);
        ivPreview = findViewById(R.id.ivFoundPreview);
        tvSelectPhoto = findViewById(R.id.tvFoundSelectPhoto);
        progressBar = findViewById(R.id.foundProgressBar);

        // Spinners setup
        spCategory.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, CATEGORIES));
        List<String> initialBusOptions = new ArrayList<>();
        initialBusOptions.add("Select Bus (Optional)");
        spBus.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, initialBusOptions));
        spSeatRow.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, ROW_OPTIONS));

        fetchBusesFromDatabase();

        // Time Picker setup
        etTime.setOnClickListener(v -> showTimePicker());

        // Image Picker Launcher
        imagePickerLauncher = registerForActivityResult(
                new ActivityResultContracts.GetContent(),
                uri -> {
                    if (uri != null) {
                        tvSelectPhoto.setText("Processing photo...");
                        processImageUriAsync(uri);
                    }
                }
        );

        findViewById(R.id.btnSelectPhoto).setOnClickListener(v -> imagePickerLauncher.launch("image/*"));
        findViewById(R.id.btnSubmitFound).setOnClickListener(v -> submitFoundItem());
    }

    private void showTimePicker() {
        Calendar c = Calendar.getInstance();
        int hour = c.get(Calendar.HOUR_OF_DAY);
        int minute = c.get(Calendar.MINUTE);

        new TimePickerDialog(this, (view, hourOfDay, minuteOfHour) -> {
            String amPm = hourOfDay >= 12 ? "PM" : "AM";
            int h = hourOfDay > 12 ? hourOfDay - 12 : (hourOfDay == 0 ? 12 : hourOfDay);
            String formatted = String.format(Locale.getDefault(), "%02d:%02d %s", h, minuteOfHour, amPm);
            etTime.setText(formatted);
        }, hour, minute, false).show();
    }

    private void processImageUriAsync(Uri uri) {
        java.util.concurrent.Executors.newSingleThreadExecutor().execute(() -> {
            try {
                // 1. Measure bounds first to prevent OutOfMemory
                BitmapFactory.Options options = new BitmapFactory.Options();
                options.inJustDecodeBounds = true;
                InputStream is1 = getContentResolver().openInputStream(uri);
                BitmapFactory.decodeStream(is1, null, options);
                if (is1 != null) is1.close();

                int maxDim = 800;
                int inSampleSize = 1;
                if (options.outHeight > maxDim || options.outWidth > maxDim) {
                    final int halfHeight = options.outHeight / 2;
                    final int halfWidth = options.outWidth / 2;
                    while ((halfHeight / inSampleSize) >= maxDim && (halfWidth / inSampleSize) >= maxDim) {
                        inSampleSize *= 2;
                    }
                }

                // 2. Decode scaled down bitmap
                options.inJustDecodeBounds = false;
                options.inSampleSize = inSampleSize;
                InputStream is2 = getContentResolver().openInputStream(uri);
                Bitmap bitmap = BitmapFactory.decodeStream(is2, null, options);
                if (is2 != null) is2.close();

                if (bitmap != null) {
                    int w = bitmap.getWidth();
                    int h = bitmap.getHeight();
                    if (w > maxDim || h > maxDim) {
                        float ratio = Math.min((float) maxDim / w, (float) maxDim / h);
                        w = Math.round(w * ratio);
                        h = Math.round(h * ratio);
                        bitmap = Bitmap.createScaledBitmap(bitmap, w, h, true);
                    }

                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 75, baos);
                    byte[] bytes = baos.toByteArray();
                    selectedImageBase64 = "data:image/jpeg;base64," + Base64.encodeToString(bytes, Base64.NO_WRAP);

                    final Bitmap finalBmp = bitmap;
                    runOnUiThread(() -> {
                        ivPreview.setImageBitmap(finalBmp);
                        ivPreview.setScaleType(ImageView.ScaleType.CENTER_CROP);
                        tvSelectPhoto.setText("Photo Attached • Tap to Change");
                    });
                }
            } catch (Exception e) {
                runOnUiThread(() -> {
                    Toast.makeText(this, "Failed processing photo: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                    tvSelectPhoto.setText("Attach Item Photo (Tap to Select)");
                });
            }
        });
    }

    private void submitFoundItem() {
        String title = etTitle.getText().toString().trim();
        String color = etColor.getText().toString().trim();
        String location = etLocation.getText().toString().trim();
        String description = etDescription.getText().toString().trim();
        String seatNumber = etSeatNumber.getText().toString().trim();
        String time = etTime.getText().toString().trim();
        String category = spCategory.getSelectedItem().toString();

        String selectedBus = spBus.getSelectedItemPosition() > 0 ? spBus.getSelectedItem().toString() : "";
        String selectedRow = spSeatRow.getSelectedItemPosition() > 0 ? spSeatRow.getSelectedItem().toString() : "";

        if (title.isEmpty() || description.isEmpty()) {
            Toast.makeText(this, "Please enter item title and description", Toast.LENGTH_SHORT).show();
            return;
        }

        // Determine primary location
        String primaryLocation = !selectedBus.isEmpty() ? selectedBus.split(" • ")[0] : location;
        if (primaryLocation.isEmpty()) {
            primaryLocation = "Campus Transit Network";
        }

        Integer busId = null;
        int selectedBusIndex = spBus.getSelectedItemPosition();
        if (selectedBusIndex > 0 && (selectedBusIndex - 1) < availableBuses.size()) {
            busId = availableBuses.get(selectedBusIndex - 1).getId();
        }

        progressBar.setVisibility(View.VISIBLE);

        Map<String, Object> body = new HashMap<>();
        body.put("type", "found");
        body.put("title", title);
        body.put("category", category);
        body.put("color", color);
        body.put("location_name", primaryLocation);
        body.put("description", description);
        if (busId != null) body.put("bus_id", busId);
        if (!selectedRow.isEmpty()) body.put("seat_row", selectedRow);
        if (!seatNumber.isEmpty()) body.put("seat_number", seatNumber);
        if (!time.isEmpty()) body.put("item_time", time);
        if (selectedImageBase64 != null) body.put("image_url", selectedImageBase64);

        ApiClient.getService(this).createLostFoundItem(body).enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
            @Override
            public void onResponse(Call<ApiResponse<Map<String, Object>>> call, Response<ApiResponse<Map<String, Object>>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    Toast.makeText(ReportFoundItemActivity.this, "Found item logged and processed by AI engine!", Toast.LENGTH_LONG).show();
                    finish();
                } else {
                    String errorMsg = "Failed submitting report";
                    try {
                        if (response.errorBody() != null) {
                            String errStr = response.errorBody().string();
                            if (errStr.contains("message")) {
                                org.json.JSONObject obj = new org.json.JSONObject(errStr);
                                errorMsg = obj.optString("message", errorMsg);
                            }
                        }
                    } catch (Exception ignored) {}
                    Toast.makeText(ReportFoundItemActivity.this, errorMsg, Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Map<String, Object>>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(ReportFoundItemActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void fetchBusesFromDatabase() {
        ApiClient.getService(this).getAllBuses().enqueue(new Callback<ApiResponse<List<Bus>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Bus>>> call, Response<ApiResponse<List<Bus>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    availableBuses = response.body().getData();
                    List<String> busNames = new ArrayList<>();
                    busNames.add("Select Bus (Optional)");
                    for (Bus b : availableBuses) {
                        String label = "Bus " + b.getBusNumber() + " • " + b.getLicensePlate();
                        if (b.getRouteName() != null && !b.getRouteName().isEmpty()) {
                            label += " (" + b.getRouteName() + ")";
                        }
                        busNames.add(label);
                    }
                    busNames.add("Other / Campus Transit Stop");
                    spBus.setAdapter(new ArrayAdapter<>(ReportFoundItemActivity.this, android.R.layout.simple_spinner_dropdown_item, busNames));
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Bus>>> call, Throwable t) {}
        });
    }
}
