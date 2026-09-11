package com.unitrack.app.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class Trip implements Serializable {
    @SerializedName("id")
    private int id;

    @SerializedName("bus_id")
    private int busId;

    @SerializedName("driver_id")
    private int driverId;

    @SerializedName("route_id")
    private int routeId;

    @SerializedName("trip_type")
    private String tripType;

    @SerializedName("status")
    private String status; // 'scheduled', 'in_progress', 'completed'

    @SerializedName("bus_number")
    private String busNumber;

    @SerializedName("license_plate")
    private String licensePlate;

    @SerializedName("driver_name")
    private String driverName;

    @SerializedName("driver_phone")
    private String driverPhone;

    @SerializedName("route_name")
    private String routeName;

    @SerializedName("route_code")
    private String routeCode;

    @SerializedName("current_latitude")
    private Double currentLatitude;

    @SerializedName("current_longitude")
    private Double currentLongitude;

    @SerializedName("current_speed")
    private Double currentSpeed;

    @SerializedName("current_heading")
    private Double currentHeading;

    public Trip() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getBusId() { return busId; }
    public void setBusId(int busId) { this.busId = busId; }

    public int getDriverId() { return driverId; }
    public void setDriverId(int driverId) { this.driverId = driverId; }

    public int getRouteId() { return routeId; }
    public void setRouteId(int routeId) { this.routeId = routeId; }

    public String getTripType() { return tripType; }
    public void setTripType(String tripType) { this.tripType = tripType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getBusNumber() { return busNumber; }
    public void setBusNumber(String busNumber) { this.busNumber = busNumber; }

    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }

    public String getDriverPhone() { return driverPhone; }
    public void setDriverPhone(String driverPhone) { this.driverPhone = driverPhone; }

    public String getRouteName() { return routeName; }
    public void setRouteName(String routeName) { this.routeName = routeName; }

    public String getRouteCode() { return routeCode; }
    public void setRouteCode(String routeCode) { this.routeCode = routeCode; }

    public Double getCurrentLatitude() { return currentLatitude; }
    public void setCurrentLatitude(Double currentLatitude) { this.currentLatitude = currentLatitude; }

    public Double getCurrentLongitude() { return currentLongitude; }
    public void setCurrentLongitude(Double currentLongitude) { this.currentLongitude = currentLongitude; }

    public Double getCurrentSpeed() { return currentSpeed; }
    public void setCurrentSpeed(Double currentSpeed) { this.currentSpeed = currentSpeed; }

    public Double getCurrentHeading() { return currentHeading; }
    public void setCurrentHeading(Double currentHeading) { this.currentHeading = currentHeading; }
}
