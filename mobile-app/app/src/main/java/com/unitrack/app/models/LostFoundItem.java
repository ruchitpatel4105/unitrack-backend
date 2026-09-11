package com.unitrack.app.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;
import java.util.List;

public class LostFoundItem implements Serializable {
    @SerializedName("id")
    private int id;

    @SerializedName("user_id")
    private int userId;

    @SerializedName("type")
    private String type; // 'lost' or 'found'

    @SerializedName("title")
    private String title;

    @SerializedName("description")
    private String description;

    @SerializedName("category")
    private String category;

    @SerializedName("color")
    private String color;

    @SerializedName("item_date")
    private String itemDate;

    @SerializedName("location_name")
    private String locationName;

    @SerializedName("bus_id")
    private Integer busId;

    @SerializedName("bus_number")
    private String busNumber;

    @SerializedName("image_url")
    private String imageUrl;

    @SerializedName("status")
    private String status; // 'reported', 'matched', 'claimed', 'resolved'

    @SerializedName("reporter_name")
    private String reporterName;

    @SerializedName("matches")
    private List<AiMatch> matches;

    public LostFoundItem() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getItemDate() { return itemDate; }
    public void setItemDate(String itemDate) { this.itemDate = itemDate; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public Integer getBusId() { return busId; }
    public void setBusId(Integer busId) { this.busId = busId; }

    public String getBusNumber() { return busNumber; }
    public void setBusNumber(String busNumber) { this.busNumber = busNumber; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }

    public List<AiMatch> getMatches() { return matches; }
    public void setMatches(List<AiMatch> matches) { this.matches = matches; }
}
