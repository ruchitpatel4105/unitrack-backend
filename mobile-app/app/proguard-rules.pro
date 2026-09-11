# Uni-Track Proguard Rules
-keepattributes *Annotation*
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
-keep class com.unitrack.app.models.** { *; }
-dontwarn io.socket.**
-dontwarn okhttp3.**
-dontwarn retrofit2.**
