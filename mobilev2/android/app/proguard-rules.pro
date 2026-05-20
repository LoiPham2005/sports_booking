# ════════════════════════════════════════════════════════════════
# ProGuard / R8 rules — flutter_base2
# ════════════════════════════════════════════════════════════════
#
# Áp dụng khi `isMinifyEnabled = true` (release build).
# Thêm `-keep` rules cho library nào dùng reflection/JNI/native.

# ─── Flutter ──────────────────────────────────────────────────────
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# ─── Firebase ─────────────────────────────────────────────────────
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Crashlytics — giữ stack trace info
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception

# ─── Google Mobile Ads ────────────────────────────────────────────
-keep class com.google.android.gms.ads.** { *; }
-keep public class com.google.android.gms.common.internal.safeparcel.SafeParcelable { *; }
-keepclassmembers class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator CREATOR;
}

# ─── Retrofit / OkHttp / Gson ─────────────────────────────────────
-dontwarn retrofit2.**
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class retrofit2.** { *; }
-keepattributes Signature
-keepattributes Exceptions
-keepclasseswithmembers class * {
    @retrofit2.http.* <methods>;
}

# ─── Kotlin coroutines ────────────────────────────────────────────
-keepclassmembers class kotlinx.coroutines.** {
    volatile <fields>;
}

# ─── Native methods (JNI) ─────────────────────────────────────────
-keepclasseswithmembernames class * {
    native <methods>;
}

# ─── Enum (json_serializable, freezed dùng) ───────────────────────
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# ─── Parcelable ───────────────────────────────────────────────────
-keep class * implements android.os.Parcelable {
    public static final ** CREATOR;
}

# ─── flutter_local_notifications ─────────────────────────────────
-keep class com.dexterous.** { *; }

# ─── RevenueCat (IAP) ────────────────────────────────────────────
-keep class com.revenuecat.purchases.** { *; }

# ─── permission_handler ───────────────────────────────────────────
-keep class com.baseflow.permissionhandler.** { *; }

# ─── Play Core (Flutter deferred components) ──────────────────────
# Flutter embedding reference `com.google.android.play.core.*` cho
# split install / deferred features. Nếu app KHÔNG dùng deferred
# components → không cần play:core dep, chỉ cần dontwarn để R8 bỏ qua.
# Nếu dùng deferred components, thêm dep `com.google.android.play:core:1.10.3`
# vào build.gradle.kts thay vì rule này.
-dontwarn com.google.android.play.core.**
-keep class com.google.android.play.core.** { *; }
