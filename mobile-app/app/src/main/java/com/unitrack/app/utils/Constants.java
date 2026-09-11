package com.unitrack.app.utils;

public class Constants {
    // Permanent Render.com 24/7 Cloud Backend
    public static final String BASE_URL = "https://unitrack-backend-9vu0.onrender.com/api/";
    public static final String SOCKET_URL = "https://unitrack-backend-9vu0.onrender.com";

    // Intent Extras
    public static final String EXTRA_ROUTE_ID = "extra_route_id";
    public static final String EXTRA_ROUTE = "extra_route";
    public static final String EXTRA_BUS_ID = "extra_bus_id";
    public static final String EXTRA_BUS = "extra_bus";
    public static final String EXTRA_ITEM = "extra_item";
    public static final String EXTRA_ITEM_ID = "extra_item_id";
    public static final String EXTRA_AI_MATCH = "extra_ai_match";
    public static final String EXTRA_ROLE = "extra_role";

    // Roles
    public static final String ROLE_STUDENT = "student";
    public static final String ROLE_DRIVER = "driver";
    public static final String ROLE_ADMIN = "admin";

    // Socket Events
    public static final String EVENT_DRIVER_JOIN = "driver:join";
    public static final String EVENT_LOCATION_UPDATE = "driver:location_update";
    public static final String EVENT_START_TRIP = "driver:start_trip";
    public static final String EVENT_END_TRIP = "driver:end_trip";
    public static final String EVENT_EMERGENCY = "driver:emergency";
    public static final String EVENT_TRACK_BUS = "student:track_bus";
    public static final String EVENT_BUS_LOCATION = "bus:location_update";

    // Notifications Channel
    public static final String CHANNEL_ID_EMERGENCY = "unitrack_emergency_channel";
    public static final String CHANNEL_ID_TRACKING = "unitrack_tracking_channel";

    public static String resolveImageUrl(android.content.Context context, String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return null;
        }
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            return imageUrl;
        }
        String baseUrl = SessionManager.getInstance(context).getServerUrl();
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        if (baseUrl.endsWith("/api")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 4);
        }
        if (!imageUrl.startsWith("/")) {
            imageUrl = "/" + imageUrl;
        }
        return baseUrl + imageUrl;
    }
}
