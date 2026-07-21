# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# Kilitlenme raporlarında satır numarası çözümü için (mapping AAB'ye gömülür).
-keepattributes SourceFile,LineNumberTable

# @capacitor-firebase/authentication, kullanmadığımız Facebook girişine derleme
# zamanında referans veriyor (rgcfaIncludeFacebook=false → SDK pakette yok);
# R8'in "missing class" hatası bu yüzden bastırılır. Çalışma zamanında Facebook
# koduna hiç girilmediğinden güvenlidir.
-dontwarn com.facebook.CallbackManager$Factory
-dontwarn com.facebook.CallbackManager
-dontwarn com.facebook.FacebookCallback
-dontwarn com.facebook.login.LoginManager
-dontwarn com.facebook.login.widget.LoginButton
