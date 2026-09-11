package com.unitrack.app.activities;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.unitrack.app.R;
import com.unitrack.app.fragments.StudentHomeFragment;
import com.unitrack.app.fragments.StudentLiveBusFragment;
import com.unitrack.app.fragments.StudentLostFoundFragment;
import com.unitrack.app.fragments.StudentProfileFragment;
import com.unitrack.app.fragments.StudentRoutesFragment;

public class StudentDashboardActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_student_dashboard);

        BottomNavigationView bottomNav = findViewById(R.id.bottomNavigation);
        bottomNav.setOnItemSelectedListener(item -> {
            Fragment selectedFragment = null;
            int itemId = item.getItemId();

            if (itemId == R.id.nav_student_home) {
                selectedFragment = new StudentHomeFragment();
            } else if (itemId == R.id.nav_student_live_bus) {
                selectedFragment = new StudentLiveBusFragment();
            } else if (itemId == R.id.nav_student_routes) {
                selectedFragment = new StudentRoutesFragment();
            } else if (itemId == R.id.nav_student_lost_found) {
                selectedFragment = new StudentLostFoundFragment();
            } else if (itemId == R.id.nav_student_profile) {
                selectedFragment = new StudentProfileFragment();
            }

            if (selectedFragment != null) {
                getSupportFragmentManager().beginTransaction()
                        .replace(R.id.fragmentContainer, selectedFragment)
                        .commit();
                return true;
            }
            return false;
        });

        // Set default fragment
        if (savedInstanceState == null) {
            getSupportFragmentManager().beginTransaction()
                    .replace(R.id.fragmentContainer, new StudentHomeFragment())
                    .commit();
        }
    }
}
