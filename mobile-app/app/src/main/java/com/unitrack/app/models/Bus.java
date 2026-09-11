package com.unitrack.app.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class Bus implements Serializable {
    @SerializedName("id")
    private int id;

    @SerializedName("bus_number")
    private String busNumber;

    @SerializedName("license_plate")
    private String licensePlate;

    @SerializedName("capacity")
    private int capacity;

    @SerializedName("status")
    private String status;

    @SerializedName("assigned_driver_id")
    private Integer assignedDriverId;

    @SerializedName("current_route_id")
    private Integer currentRouteId;

    @SerializedName("driver_name")
    private String driverName;

    @SerializedName("driver_phone")
    private String driverPhone;

    @SerializedName("route_name")
    private String routeName;

    @SerializedName("route_code")
    private String routeCode;

    public Bus() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getBusNumber() { return busNumber; }
    public void setBusNumber(String busNumber) { this.busNumber = busNumber; }

    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getAssignedDriverId() { return assignedDriverId; }
    public void setAssignedDriverId(Integer assignedDriverId) { this.assignedDriverId = assignedDriverId; }

    public Integer getCurrentRouteId() { return currentRouteId; }
    public void setCurrentRouteId(Integer currentRouteId) { this.currentRouteId = currentRouteId; }

    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }

    public String getDriverPhone() { return driverPhone; }
    public void setDriverPhone(String driverPhone) { this.driverPhone = driverPhone; }

    public String getRouteName() { return routeName; }
    public void setRouteName(String routeName) { this.routeName = routeName; }

    public String getRouteCode() { return routeCode; }
    public void setRouteCode(String routeCode) { this.routeCode = routeCode; }
}
