package com.unitrack.app.network;

import com.unitrack.app.models.*;
import java.util.List;
import java.util.Map;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.*;

public interface ApiService {

    // Auth
    @POST("auth/login")
    Call<AuthResponse> login(@Body Map<String, String> body);

    @GET("auth/me")
    Call<ApiResponse<User>> getMe();

    @PUT("auth/change-password")
    Call<ApiResponse<Map<String, Object>>> changePassword(@Body Map<String, String> body);

    // Buses
    @GET("buses")
    Call<ApiResponse<List<Bus>>> getAllBuses();

    @GET("buses/{id}")
    Call<ApiResponse<Bus>> getBusById(@Path("id") int id);

    // Routes
    @GET("routes")
    Call<ApiResponse<List<Route>>> getAllRoutes();

    @GET("routes/{id}")
    Call<ApiResponse<Route>> getRouteById(@Path("id") int id);

    // Trips
    @GET("trips/active")
    Call<ApiResponse<List<Trip>>> getActiveTrips();

    @GET("trips/driver/current")
    Call<ApiResponse<Trip>> getDriverCurrentTrip();

    @POST("trips/start")
    Call<ApiResponse<Map<String, Object>>> startTrip(@Body Map<String, Object> body);

    @POST("trips/end")
    Call<ApiResponse<Map<String, Object>>> endTrip(@Body Map<String, Object> body);

    @POST("trips/location")
    Call<ApiResponse<Map<String, Object>>> recordLocation(@Body LocationUpdate location);

    // Lost & Found
    @GET("lost-found")
    Call<ApiResponse<List<LostFoundItem>>> getLostFoundItems(
            @Query("type") String type,
            @Query("category") String category,
            @Query("status") String status
    );

    @GET("lost-found/{id}")
    Call<ApiResponse<LostFoundItem>> getLostFoundItemById(@Path("id") int id);

    @POST("lost-found")
    Call<ApiResponse<Map<String, Object>>> createLostFoundItem(@Body Map<String, Object> body);

    @Multipart
    @POST("lost-found")
    Call<ApiResponse<Map<String, Object>>> createLostFoundItemWithPhoto(
            @Part("type") RequestBody type,
            @Part("title") RequestBody title,
            @Part("description") RequestBody description,
            @Part("category") RequestBody category,
            @Part("color") RequestBody color,
            @Part("location_name") RequestBody locationName,
            @Part MultipartBody.Part image
    );

    @POST("lost-found/claim")
    Call<ApiResponse<Map<String, Object>>> submitClaim(@Body Map<String, Object> body);

    @GET("lost-found/claims")
    Call<ApiResponse<List<Claim>>> getMyClaims();

    // Emergency
    @POST("emergency")
    Call<ApiResponse<Map<String, Object>>> reportEmergency(@Body Map<String, Object> body);

    // Notifications
    @GET("notifications")
    Call<ApiResponse<List<NotificationItem>>> getNotifications();

    @PUT("notifications/{id}/read")
    Call<ApiResponse<Void>> markNotificationRead(@Path("id") int id);
}
