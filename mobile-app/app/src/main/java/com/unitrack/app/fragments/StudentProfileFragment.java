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

public class StudentProfileFragment extends Fragment {

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_student_profile, container, false);

        TextView tvName = view.findViewById(R.id.tvStudentName);
        TextView tvId = view.findViewById(R.id.tvStudentId);
        TextView tvEmail = view.findViewById(R.id.tvStudentEmail);
        TextView tvPhone = view.findViewById(R.id.tvStudentPhone);

        SessionManager session = SessionManager.getInstance(requireContext());
        User user = session.getUser();
        if (user != null) {
            tvName.setText(user.getName());
            tvId.setText("Student ID: " + (user.getStudentId() != null ? user.getStudentId() : "N/A"));
            tvEmail.setText("Email: " + user.getEmail());
            tvPhone.setText("Phone: " + user.getPhone());
        }

        view.findViewById(R.id.btnStudentLogout).setOnClickListener(v -> {
            session.clearSession();
            Intent intent = new Intent(requireContext(), RoleSelectionActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
        });

        return view;
    }
}
