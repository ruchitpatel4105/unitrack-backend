package com.unitrack.app.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class LocationUpdate implements Serializable {
    @SerializedName("trip_id")
    private Integer tripId;

    @SerializedName("bus_id")
    private int busId;

    @SerializedName("latitude")
    private double latitude;

    @SerializedName("longitude")
    private double longitude;

    @SerializedName("speed")
    private double speed;

    @SerializedName("heading")
    private double heading;

    @SerializedName("accuracy")
    private double accuracy;

    @SerializedName("recorded_at")
    private String recordedAt;

    public LocationUpdate() {}

    public LocationUpdate(Integer tripId, int busId, double latitude, double longitude, double speed, double heading, double accuracy) {
        this.tripId = tripId;
        this.busId = busId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.speed = speed;
        this.heading = heading;
        this.accuracy = accuracy;
    }

    public Integer getTripId() { return tripId; }
    public void setTripId(Integer tripId) { this.tripId = tripId; }

    public int getBusId() { return busId; }
    public void setBusId(int busId) { this.busId = busId; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public double getSpeed() { return speed; }
    public void setSpeed(double speed) { this.speed = speed; }

    public double getHeading() { return heading; }
    public void setHeading(double heading) { this.heading = heading; }

    public double getAccuracy() { return accuracy; }
    public void setAccuracy(double accuracy) { this.accuracy = accuracy; }

    public String getRecordedAt() { return recordedAt; }
    public void setRecordedAt(String recordedAt) { this.recordedAt = recordedAt; }
}
