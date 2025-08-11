package com.example.deepfakemobile;

import java.util.List;

import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;

public interface ApiService {

    // The /scan endpoint now accepts a 'file' part and a 'userId' part.
    @Multipart
    @POST("scan")
    Call<ResponseBody> uploadImage(
            @Part MultipartBody.Part file,
            @Part("userId") RequestBody userId
    );

    // The /history endpoint accepts a JSON body with a userId
    // and returns a list of ScanResult objects.
    @POST("history")
    Call<List<ScanResult>> getUserHistory(@Body RequestBody body);
}
