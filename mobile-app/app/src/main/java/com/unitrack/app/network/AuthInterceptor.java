package com.unitrack.app.network;

import android.content.Context;
import androidx.annotation.NonNull;
import com.unitrack.app.utils.SessionManager;
import java.io.IOException;
import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;

public class AuthInterceptor implements Interceptor {
    private final Context context;

    public AuthInterceptor(Context context) {
        this.context = context.getApplicationContext();
    }

    @NonNull
    @Override
    public Response intercept(@NonNull Chain chain) throws IOException {
        Request originalRequest = chain.request();
        SessionManager sessionManager = SessionManager.getInstance(context);
        String token = sessionManager.getToken();

        if (token != null && !token.isEmpty()) {
            Request authorisedRequest = originalRequest.newBuilder()
                    .header("Authorization", "Bearer " + token)
                    .build();
            return chain.proceed(authorisedRequest);
        }

        return chain.proceed(originalRequest);
    }
}
