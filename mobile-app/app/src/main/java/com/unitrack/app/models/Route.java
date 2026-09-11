package com.unitrack.app.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;
import java.util.List;

public class Route implements Serializable {
    @SerializedName("id")
    private int id;

    @SerializedName("route_name")
    private String routeName;

    @SerializedName("route_code")
    private String routeCode;

    @SerializedName("description")
    private String description;

    @SerializedName("start_point")
    private String startPoint;

    @SerializedName("end_point")
    private String endPoint;

    @SerializedName("estimated_duration_mins")
    private int estimatedDurationMins;

    @SerializedName("distance_km")
    private double distanceKm;

    @SerializedName("is_active")
    private int isActive;

    @SerializedName("stops")
    private List<RouteStop> stops;

    public Route() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getRouteName() { return routeName; }
    public void setRouteName(String routeName) { this.routeName = routeName; }

    public String getRouteCode() { return routeCode; }
    public void setRouteCode(String routeCode) { this.routeCode = routeCode; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStartPoint() { return startPoint; }
    public void setStartPoint(String startPoint) { this.startPoint = startPoint; }

    public String getEndPoint() { return endPoint; }
    public void setEndPoint(String endPoint) { this.endPoint = endPoint; }

    public int getEstimatedDurationMins() { return estimatedDurationMins; }
    public void setEstimatedDurationMins(int estimatedDurationMins) { this.estimatedDurationMins = estimatedDurationMins; }

    public double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(double distanceKm) { this.distanceKm = distanceKm; }

    public int getIsActive() { return isActive; }
    public void setIsActive(int isActive) { this.isActive = isActive; }

    public List<RouteStop> getStops() { return stops; }
    public void setStops(List<RouteStop> stops) { this.stops = stops; }
}
