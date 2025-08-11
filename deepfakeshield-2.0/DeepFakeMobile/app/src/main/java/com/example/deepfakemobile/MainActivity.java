package com.example.deepfakemobile;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import androidx.core.content.ContextCompat;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.bumptech.glide.Glide;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;


public class MainActivity extends AppCompatActivity {

    // !!! IMPORTANT !!!
    // REPLACE WITH YOUR COMPUTER'S LOCAL IP ADDRESS
    public static final String BASE_URL = "http://192.168.8.226:5000";

    private ImageView imageView;
    private Button buttonSelectImage, buttonDetect, buttonViewHistory;
    private TextView textResultLabel, textResultConfidence, textUserId;
    private ProgressBar progressBar;
    private CardView cardResult;

    private Uri selectedImageUri;
    private ApiService apiService;
    private FirebaseAuth mAuth; // Firebase Auth instance
    private String userId;

    private final ActivityResultLauncher<Intent> imagePickerLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                    selectedImageUri = result.getData().getData();
                    if (selectedImageUri != null) {
                        Glide.with(this).load(selectedImageUri).into(imageView);
                        buttonDetect.setEnabled(true);
                        cardResult.setVisibility(View.GONE);
                    }
                }
            }
    );

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initViews();
        setupRetrofit();
        setupListeners();

        // Initialize Firebase Auth
        mAuth = FirebaseAuth.getInstance();
    }

    @Override
    protected void onStart() {
        super.onStart();
        // Check if user is signed in (anonymous) and update UI accordingly.
        FirebaseUser currentUser = mAuth.getCurrentUser();
        if (currentUser == null) {
            signInAnonymously();
        } else {
            updateUI(currentUser);
        }
    }

    private void signInAnonymously() {
        mAuth.signInAnonymously()
                .addOnCompleteListener(this, task -> {
                    if (task.isSuccessful()) {
                        Log.d("AUTH", "signInAnonymously:success");
                        FirebaseUser user = mAuth.getCurrentUser();
                        updateUI(user);
                    } else {
                        Log.w("AUTH", "signInAnonymously:failure", task.getException());
                        Toast.makeText(MainActivity.this, "Authentication failed.",
                                Toast.LENGTH_SHORT).show();
                        updateUI(null);
                    }
                });
    }

    private void updateUI(FirebaseUser user) {
        if (user != null) {
            this.userId = user.getUid();
            textUserId.setText("UserID: " + this.userId.substring(0, 13) + "...");
        } else {
            textUserId.setText("Not Authenticated");
        }
    }

    private void initViews() {
        imageView = findViewById(R.id.imageView);
        buttonSelectImage = findViewById(R.id.buttonSelectImage);
        buttonDetect = findViewById(R.id.buttonDetect);
        buttonViewHistory = findViewById(R.id.buttonViewHistory);
        textResultLabel = findViewById(R.id.textResultLabel);
        textResultConfidence = findViewById(R.id.textResultConfidence);
        textUserId = findViewById(R.id.textUserId);
        progressBar = findViewById(R.id.progressBar);
        cardResult = findViewById(R.id.cardResult);
    }

    private void setupRetrofit() {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        apiService = retrofit.create(ApiService.class);
    }

    private void setupListeners() {
        buttonSelectImage.setOnClickListener(v -> openImageChooser());
        buttonDetect.setOnClickListener(v -> {
            if (selectedImageUri != null) {
                uploadImageAndDetect(selectedImageUri);
            } else {
                Toast.makeText(this, "Please select an image first", Toast.LENGTH_SHORT).show();
            }
        });
        buttonViewHistory.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, HistoryActivity.class);
            startActivity(intent);
        });
    }

    private void openImageChooser() {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("image/*");
        imagePickerLauncher.launch(intent);
    }

    private void uploadImageAndDetect(Uri imageUri) {
        if (userId == null) {
            Toast.makeText(this, "User not authenticated. Please wait.", Toast.LENGTH_SHORT).show();
            return;
        }

        setLoadingState(true);

        try {
            InputStream inputStream = getContentResolver().openInputStream(imageUri);
            byte[] imageBytes = getBytes(inputStream);

            RequestBody requestFile = RequestBody.create(MediaType.parse(getContentResolver().getType(imageUri)), imageBytes);
            MultipartBody.Part body = MultipartBody.Part.createFormData("file", "image.jpg", requestFile);
            RequestBody userIdBody = RequestBody.create(MediaType.parse("text/plain"), userId);

            Call<ResponseBody> call = apiService.uploadImage(body, userIdBody);
            call.enqueue(new Callback<ResponseBody>() {
                @Override
                public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                    setLoadingState(false);
                    if (response.isSuccessful() && response.body() != null) {
                        try {
                            String jsonString = response.body().string();
                            JSONObject jsonObject = new JSONObject(jsonString);
                            String label = jsonObject.getString("label");
                            double confidence = jsonObject.getDouble("confidence");
                            displayResults(label, confidence);
                        } catch (IOException | JSONException e) {
                            showError("Error parsing response: " + e.getMessage());
                        }
                    } else {
                        showError("Detection failed: " + response.message());
                    }
                }

                @Override
                public void onFailure(Call<ResponseBody> call, Throwable t) {
                    setLoadingState(false);
                    showError("Network error: " + t.getMessage());
                }
            });

        } catch (IOException e) {
            e.printStackTrace();
            setLoadingState(false);
            showError("Error reading image file");
        }
    }

    private void setLoadingState(boolean isLoading) {
        progressBar.setVisibility(isLoading ? View.VISIBLE : View.GONE);
        buttonDetect.setEnabled(!isLoading);
        buttonSelectImage.setEnabled(!isLoading);
        if (isLoading) {
            cardResult.setVisibility(View.GONE);
        }
    }

    private void showError(String message) {
        Toast.makeText(MainActivity.this, message, Toast.LENGTH_LONG).show();
    }

    private void displayResults(String label, double confidence) {
        cardResult.setVisibility(View.VISIBLE);
        textResultLabel.setText(label.toUpperCase(Locale.ROOT));
        textResultConfidence.setText(String.format(Locale.US, "%.2f%% Confidence", confidence * 100));

        if (label.equalsIgnoreCase("real")) {
            textResultLabel.setTextColor(ContextCompat.getColor(this, android.R.color.holo_green_dark));
        } else {
            textResultLabel.setTextColor(ContextCompat.getColor(this, android.R.color.holo_red_dark));
        }
    }

    private byte[] getBytes(InputStream inputStream) throws IOException {
        ByteArrayOutputStream byteBuffer = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        int len;
        while ((len = inputStream.read(buffer)) != -1) {
            byteBuffer.write(buffer, 0, len);
        }
        return byteBuffer.toByteArray();
    }
}