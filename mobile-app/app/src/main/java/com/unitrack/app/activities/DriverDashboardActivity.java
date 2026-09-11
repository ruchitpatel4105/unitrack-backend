package com.unitrack.app.activities;

import android.content.Intent;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.unitrack.app.R;
import com.unitrack.app.fragments.DriverBusFragment;
import com.unitrack.app.fragments.DriverDashboardFragment;
import com.unitrack.app.fragments.DriverProfileFragment;
import com.unitrack.app.fragments.DriverTripFragment;

public class DriverDashboardActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_driver_dashboard);

        BottomNavigationView bottomNav = findViewById(R.id.driverBottomNav);
        bottomNav.setOnItemSelectedListener(item -> {
            Fragment selected = null;
            int itemId = item.getItemId();

            if (itemId == R.id.nav_driver_dashboard) {
                selected = new DriverDashboardFragment();
            } else if (itemId == R.id.nav_driver_bus) {
                selected = new DriverBusFragment();
            } else if (itemId == R.id.nav_driver_trip) {
                selected = new DriverTripFragment();
            } else if (itemId == R.id.nav_driver_emergency) {
                startActivity(new Intent(this, DriverEmergencyActivity.class));
                return false;
            } else if (itemId == R.id.nav_driver_profile) {
                selected = new DriverProfileFragment();
            }

            if (selected != null) {
                getSupportFragmentManager().beginTransaction()
                        .replace(R.id.driverFragmentContainer, selected)
                        .commit();
                return true;
            }
            return false;
        });

        if (savedInstanceState == null) {
            getSupportFragmentManager().beginTransaction()
                    .replace(R.id.driverFragmentContainer, new DriverDashboardFragment())
                    .commit();
        }
    }
}
