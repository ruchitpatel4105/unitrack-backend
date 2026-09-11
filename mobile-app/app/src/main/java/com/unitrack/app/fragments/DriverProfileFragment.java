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
import com.unitrack.app.activities.RoleSelectionActivity;
import com.unitrack.app.models.User;
import com.unitrack.app.utils.SessionManager;

public class DriverProfileFragment extends Fragment {

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_driver_profile, container, false);

        TextView tvName = view.findViewById(R.id.tvDriverProfileName);
        TextView tvId = view.findViewById(R.id.tvDriverBadgeId);
        TextView tvEmail = view.findViewById(R.id.tvDriverEmail);
        TextView tvPhone = view.findViewById(R.id.tvDriverPhone);

        SessionManager session = SessionManager.getInstance(requireContext());
        User user = session.getUser();
        if (user != null) {
            tvName.setText(user.getName());
            tvId.setText("Driver Badge: " + (user.getDriverId() != null ? user.getDriverId() : "DRV-101"));
            tvEmail.setText("Email: " + user.getEmail());
            tvPhone.setText("Phone: " + user.getPhone());
        }

        view.findViewById(R.id.btnDriverLogout).setOnClickListener(v -> {
            session.clearSession();
            Intent intent = new Intent(requireContext(), RoleSelectionActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
        });

        return view;
    }
}
