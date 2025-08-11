package com.example.deepfakemobile;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;
import java.util.Locale;

public class HistoryAdapter extends RecyclerView.Adapter<HistoryAdapter.HistoryViewHolder> {

    private final List<ScanResult> historyList;
    private final Context context;

    public HistoryAdapter(Context context, List<ScanResult> historyList) {
        this.context = context;
        this.historyList = historyList;
    }

    @NonNull
    @Override
    public HistoryViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_history, parent, false);
        return new HistoryViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull HistoryViewHolder holder, int position) {
        ScanResult scanResult = historyList.get(position);

        holder.textFilename.setText(scanResult.getFilename());
        holder.textTimestamp.setText(scanResult.getTimestamp());
        holder.textConfidence.setText(String.format(Locale.US, "%.2f%%", scanResult.getConfidence() * 100));

        // Set icon and color based on the label
        if ("real".equalsIgnoreCase(scanResult.getLabel())) {
            holder.imageIcon.setImageResource(R.drawable.ic_launcher_foreground); // Replace with a real checkmark icon
            holder.imageIcon.setColorFilter(ContextCompat.getColor(context, android.R.color.holo_green_dark));
        } else {
            holder.imageIcon.setImageResource(R.drawable.ic_launcher_foreground); // Replace with a real 'X' icon
            holder.imageIcon.setColorFilter(ContextCompat.getColor(context, android.R.color.holo_red_dark));
        }
    }

    @Override
    public int getItemCount() {
        return historyList.size();
    }

    public static class HistoryViewHolder extends RecyclerView.ViewHolder {
        ImageView imageIcon;
        TextView textFilename, textTimestamp, textConfidence;

        public HistoryViewHolder(@NonNull View itemView) {
            super(itemView);
            imageIcon = itemView.findViewById(R.id.imageResultIcon);
            textFilename = itemView.findViewById(R.id.textHistoryFilename);
            textTimestamp = itemView.findViewById(R.id.textHistoryTimestamp);
            textConfidence = itemView.findViewById(R.id.textHistoryConfidence);
        }
    }
}
