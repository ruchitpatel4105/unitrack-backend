package com.unitrack.app.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class EmergencyAlert implements Serializable {
    @SerializedName("id")
    private int id;

    @SerializedName("driver_id")
    private int driverId;

    @SerializedName("bus_id")
    private int busId;

    @SerializedName("trip_id")
    private Integer tripId;

    @SerializedName("alert_type")
    private String alertType;

    @SerializedName("latitude")
    private double latitude;

    @SerializedName("longitude")
    private double longitude;

    @SerializedName("notes")
    private String notes;

    @SerializedName("status")
    private String status;

    public EmergencyAlert() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getDriverId() { return driverId; }
    public void setDriverId(int driverId) { this.driverId = driverId; }

    public int getBusId() { return busId; }
    public void setBusId(int busId) { this.busId = busId; }

    public Integer getTripId() { return tripId; }
    public void setTripId(Integer tripId) { this.tripId = tripId; }

    public String getAlertType() { return alertType; }
    public void setAlertType(String alertType) { this.alertType = alertType; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
