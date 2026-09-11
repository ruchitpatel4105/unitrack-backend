package com.unitrack.app.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class Claim implements Serializable {
    @SerializedName("id")
    private int id;

    @SerializedName("item_id")
    private int itemId;

    @SerializedName("claimant_id")
    private int claimantId;

    @SerializedName("proof_description")
    private String proofDescription;

    @SerializedName("proof_image_url")
    private String proofImageUrl;

    @SerializedName("status")
    private String status; // 'pending', 'approved', 'rejected'

    @SerializedName("admin_notes")
    private String adminNotes;

    @SerializedName("item_title")
    private String itemTitle;

    @SerializedName("item_image")
    private String itemImage;

    @SerializedName("category")
    private String category;

    public Claim() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getItemId() { return itemId; }
    public void setItemId(int itemId) { this.itemId = itemId; }

    public int getClaimantId() { return claimantId; }
    public void setClaimantId(int claimantId) { this.claimantId = claimantId; }

    public String getProofDescription() { return proofDescription; }
    public void setProofDescription(String proofDescription) { this.proofDescription = proofDescription; }

    public String getProofImageUrl() { return proofImageUrl; }
    public void setProofImageUrl(String proofImageUrl) { this.proofImageUrl = proofImageUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public String getItemTitle() { return itemTitle; }
    public void setItemTitle(String itemTitle) { this.itemTitle = itemTitle; }

    public String getItemImage() { return itemImage; }
    public void setItemImage(String itemImage) { this.itemImage = itemImage; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
