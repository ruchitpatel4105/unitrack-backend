package com.unitrack.app.fragments;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.unitrack.app.R;
import com.unitrack.app.activities.LiveBusActivity;
import com.unitrack.app.activities.NotificationsActivity;
import com.unitrack.app.activities.RouteListActivity;
import com.unitrack.app.activities.LostFoundListActivity;
import com.unitrack.app.models.User;
import com.unitrack.app.utils.SessionManager;

public class StudentHomeFragment extends Fragment {

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_student_home, container, false);

        TextView tvStudentName = view.findViewById(R.id.tvStudentName);
        User user = SessionManager.getInstance(requireContext()).getUser();
        if (user != null && user.getName() != null) {
            tvStudentName.setText(user.getName());
        }

        // Live Tracker Banner Click
        view.findViewById(R.id.btnTrackNow).setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), LiveBusActivity.class));
        });
        view.findViewById(R.id.cardLiveTransit).setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), LiveBusActivity.class));
        });

        // Routes Shortcut
        view.findViewById(R.id.cardRoutesShortcut).setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), RouteListActivity.class));
        });

        // Lost & Found Shortcut
        view.findViewById(R.id.cardLostFoundShortcut).setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), LostFoundListActivity.class));
        });

        // Notifications Icon
        view.findViewById(R.id.btnNotifications).setOnClickListener(v -> {
            startActivity(new Intent(requireContext(), NotificationsActivity.class));
        });

        return view;
    }
}
