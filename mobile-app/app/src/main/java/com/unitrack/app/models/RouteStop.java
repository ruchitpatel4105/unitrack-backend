package com.unitrack.app.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class RouteStop implements Serializable {
    @SerializedName("id")
    private int id;

    @SerializedName("route_id")
    private int routeId;

    @SerializedName("stop_name")
    private String stopName;

    @SerializedName("stop_order")
    private int stopOrder;

    @SerializedName("latitude")
    private double latitude;

    @SerializedName("longitude")
    private double longitude;

    @SerializedName("estimated_time_offset_mins")
    private int estimatedTimeOffsetMins;

    public RouteStop() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getRouteId() { return routeId; }
    public void setRouteId(int routeId) { this.routeId = routeId; }

    public String getStopName() { return stopName; }
    public void setStopName(String stopName) { this.stopName = stopName; }

    public int getStopOrder() { return stopOrder; }
    public void setStopOrder(int stopOrder) { this.stopOrder = stopOrder; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public int getEstimatedTimeOffsetMins() { return estimatedTimeOffsetMins; }
    public void setEstimatedTimeOffsetMins(int estimatedTimeOffsetMins) { this.estimatedTimeOffsetMins = estimatedTimeOffsetMins; }
}
