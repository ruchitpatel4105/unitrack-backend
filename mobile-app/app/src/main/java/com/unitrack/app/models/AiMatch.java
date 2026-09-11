package com.unitrack.app.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class AiMatch implements Serializable {
    @SerializedName("id")
    private int id;

    @SerializedName("lost_item_id")
    private int lostItemId;

    @SerializedName("found_item_id")
    private int foundItemId;

    @SerializedName("match_score")
    private double matchScore;

    @SerializedName("match_reasons")
    private String matchReasons;

    @SerializedName("status")
    private String status;

    @SerializedName("matched_title")
    private String matchedTitle;

    @SerializedName("matched_image")
    private String matchedImage;

    public AiMatch() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getLostItemId() { return lostItemId; }
    public void setLostItemId(int lostItemId) { this.lostItemId = lostItemId; }

    public int getFoundItemId() { return foundItemId; }
    public void setFoundItemId(int foundItemId) { this.foundItemId = foundItemId; }

    public double getMatchScore() { return matchScore; }
    public void setMatchScore(double matchScore) { this.matchScore = matchScore; }

    public String getMatchReasons() { return matchReasons; }
    public void setMatchReasons(String matchReasons) { this.matchReasons = matchReasons; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMatchedTitle() { return matchedTitle; }
    public void setMatchedTitle(String matchedTitle) { this.matchedTitle = matchedTitle; }

    public String getMatchedImage() { return matchedImage; }
    public void setMatchedImage(String matchedImage) { this.matchedImage = matchedImage; }
}
