package com.example.deepfakemobile;

import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.firebase.auth.FirebaseAuth;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

import okhttp3.MediaType;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class HistoryActivity extends AppCompatActivity {

    private RecyclerView recyclerView;
    private HistoryAdapter adapter;
    private ProgressBar progressBar;
    private TextView textNoHistory;
    private ApiService apiService;
    private String userId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_history);

        // Get user ID from Firebase Auth
        if (FirebaseAuth.getInstance().getCurrentUser() != null) {
            userId = FirebaseAuth.getInstance().getCurrentUser().getUid();
        }

        // Initialize views
        recyclerView = findViewById(R.id.recyclerViewHistory);
        progressBar = findViewById(R.id.progressBarHistory);
        textNoHistory = findViewById(R.id.textNoHistory);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));

        // Setup Retrofit
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(MainActivity.BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        apiService = retrofit.create(ApiService.class);

        // Fetch history if userId exists
        if (userId != null) {
            fetchHistory();
        } else {
            Toast.makeText(this, "User ID not found. Please restart the app.", Toast.LENGTH_SHORT).show();
            textNoHistory.setVisibility(View.VISIBLE);
        }
    }

    private void fetchHistory() {
        progressBar.setVisibility(View.VISIBLE);
        textNoHistory.setVisibility(View.GONE);

        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("userId", userId);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        RequestBody body = RequestBody.create(MediaType.parse("application/json; charset=utf-8"), jsonObject.toString());

        apiService.getUserHistory(body).enqueue(new Callback<List<ScanResult>>() {
            @Override
            public void onResponse(Call<List<ScanResult>> call, Response<List<ScanResult>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null && !response.body().isEmpty()) {
                    adapter = new HistoryAdapter(HistoryActivity.this, response.body());
                    recyclerView.setAdapter(adapter);
                } else {
                    textNoHistory.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public void onFailure(Call<List<ScanResult>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                textNoHistory.setVisibility(View.VISIBLE);
                Toast.makeText(HistoryActivity.this, "Failed to fetch history: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }
}