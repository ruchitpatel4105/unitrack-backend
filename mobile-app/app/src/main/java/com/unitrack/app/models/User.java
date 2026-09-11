package com.unitrack.app.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class User implements Serializable {
    @SerializedName("id")
    private int id;

    @SerializedName("role")
    private String role; // 'admin', 'student', 'driver'

    @SerializedName("name")
    private String name;

    @SerializedName("email")
    private String email;

    @SerializedName("phone")
    private String phone;

    @SerializedName("student_id")
    private String studentId;

    @SerializedName("driver_id")
    private String driverId;

    @SerializedName("avatar_url")
    private String avatarUrl;

    @SerializedName("dob")
    private String dob;

    @SerializedName("pickup_stop")
    private String pickupStop;

    @SerializedName("assigned_route_id")
    private Integer assignedRouteId;

    @SerializedName("assigned_route_name")
    private String assignedRouteName;

    @SerializedName("pass_number")
    private String passNumber;

    @SerializedName("transport_fee_status")
    private String transportFeeStatus;

    public User() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getDriverId() { return driverId; }
    public void setDriverId(String driverId) { this.driverId = driverId; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public String getPickupStop() { return pickupStop; }
    public void setPickupStop(String pickupStop) { this.pickupStop = pickupStop; }

    public Integer getAssignedRouteId() { return assignedRouteId; }
    public void setAssignedRouteId(Integer assignedRouteId) { this.assignedRouteId = assignedRouteId; }

    public String getAssignedRouteName() { return assignedRouteName; }
    public void setAssignedRouteName(String assignedRouteName) { this.assignedRouteName = assignedRouteName; }

    public String getPassNumber() { return passNumber; }
    public void setPassNumber(String passNumber) { this.passNumber = passNumber; }

    public String getTransportFeeStatus() { return transportFeeStatus; }
    public void setTransportFeeStatus(String transportFeeStatus) { this.transportFeeStatus = transportFeeStatus; }
}

