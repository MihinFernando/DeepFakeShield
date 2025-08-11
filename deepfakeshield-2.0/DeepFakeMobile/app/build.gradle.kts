plugins {
    alias(libs.plugins.android.application)
    id("com.google.gms.google-services")
}

android {
    namespace = "com.example.deepfakemobile"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.deepfakemobile"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    // --- FIX UPDATED HERE ---
    packagingOptions {
        resources {
            // Excludes the duplicate metadata files that cause the errors.
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
            excludes += "META-INF/INDEX.LIST"
            excludes += "META-INF/DEPENDENCIES"
            // NEW LINE ADDED TO FIX THE LATEST ERROR
            excludes += "META-INF/io.netty.versions.properties"
        }
    }
    // ----------------------
}

dependencies {

    implementation(libs.appcompat)
    implementation(libs.material)
    implementation(libs.activity)
    implementation(libs.constraintlayout)
    implementation(libs.firebase.appdistribution.gradle)
    testImplementation(libs.junit)
    androidTestImplementation(libs.ext.junit)
    androidTestImplementation(libs.espresso.core)

    // For easy networking to call our Python API
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")

    // For easily loading images into ImageViews
    implementation("com.github.bumptech.glide:glide:4.16.0")

    // For displaying lists, like our scan history
    implementation("androidx.recyclerview:recyclerview:1.3.2")

    // For modern UI components like CardView
    implementation("androidx.cardview:cardview:1.0.0")

    // Firebase Bill of Materials (BoM) - manages versions for you
    implementation(platform("com.google.firebase:firebase-bom:33.1.0"))

    // Add the dependency for Firebase Authentication
    implementation("com.google.firebase:firebase-auth")

}
