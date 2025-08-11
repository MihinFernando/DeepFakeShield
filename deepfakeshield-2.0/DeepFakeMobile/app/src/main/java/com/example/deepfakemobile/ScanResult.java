package com.example.deepfakemobile;

import com.google.gson.annotations.SerializedName;

public class ScanResult {

    @SerializedName("filename")
    private String filename;

    @SerializedName("timestamp")
    private String timestamp;

    @SerializedName("label")
    private String label;

    @SerializedName("confidence")
    private double confidence;

    // Getters for all fields
    public String getFilename() {
        return filename;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public String getLabel() {
        return label;
    }

    public double getConfidence() {
        return confidence;
    }
}