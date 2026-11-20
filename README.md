# Kinetix — دفتر تمرین کلیستنیکس

اپ کاملاً آفلاین، دو‌زبانه (فارسی/English)، بدون فریم‌ورک (HTML + CSS + JS) و آمادهٔ بسته‌بندی با Capacitor برای اندروید.

| | |
|---|---|
| نام اپ | **Kinetix** |
| شناسهٔ بسته | `com.kinetix.app` |
| پوشهٔ وب | `www/` |
| کلید ذخیرهٔ داده | `calis-app-v1` (localStorage + آینهٔ Preferences) |

## ساختار

```
www/                 کل اپ وب (index.html, css, js, fonts, icons, manifest.json)
locales/fa.json      ترجمه‌ها (رابط، نام و توضیح ۱۳۷ حرکت)
locales/en.json
tools/               build-locales.mjs (JSON → www/js/locales.js) ، gen_icons.py ، apply-moves-patch*.cjs و moves-patch-*.cjs/json (دادهٔ «آپدیت حرکات»؛ فقط یک بار اجرا شده‌اند)
assets/              آیکون و اسپلش (ورودی capacitor-assets)
scripts/             patch-android.mjs ، make_assets.py
.github/workflows/   build-apk.yml  (بیلد ابری)
capacitor.config.json
```

> اگر `locales/*.json` را ویرایش کردید، `npm run locales` را اجرا کنید (در `npm run sync` خودکار اجرا می‌شود).

## آفلاین بودن (بررسی‌شده)
- تمام اپ (حرکات، برنامه، اهداف، آمار، توضیح حرکات) **کاملاً آفلاین** است: هیچ CDN، Google Fonts یا تصویر خارجی وجود ندارد؛ فونت Waw و آیکون‌ها داخل `www/` هستند.
- داده‌ها در localStorage ذخیره و با `@capacitor/preferences` روی دستگاه آینه می‌شوند.
- مجوز `INTERNET` را قالب Capacitor خودش در مانیفست می‌گذارد (WebView به آن نیاز دارد)؛ اسکریپت `scripts/patch-android.mjs` پس از هر sync مطمئن می‌شود مجوزهای شبکه سر جایشان هستند.

## قابلیت‌ها و ماژول‌ها
| قابلیت | فایل‌ها | یادداشت |
|---|---|---|
| پروفایل | `viewProfile` در `www/js/app.js` | نام، سن، قد، وزن، سطح (برای چالش روزانه)، مهارت‌ها و رکوردها (خودکار از تمرین‌ها + ثبت دستی). برنامهٔ نمونه و آزمون تعیین سطح حذف شده؛ برنامه یک دفترچهٔ تمرین است و از خالی شروع می‌شود. |
| هفته‌های شماره‌دار | `www/js/app.js` (بخش «هفته‌ها») | برنامه هر هفته ریست نمی‌شود. «پایان هفته و شروع هفتهٔ بعد» عکسی از هفته را در `D.weeks` ذخیره می‌کند (نمای «هفته‌های قبل») و برنامه را با ارتقاهای پیشنهادی ادامه می‌دهد: حرکت‌های کاملِ این هفته +۱ تکرار / +۵ ثانیه، یا حرکت سخت‌تر بعدی در مسیر `CHAINS`، یا +۱ ست (از ۱۲ تکرار / ۶۰ ثانیه به بالا، تا ۵ ست). در پیش‌نمایش هفتهٔ بعد هر حرکت قابل‌ویرایش است: عوض‌کردن حرکت، کم و زیاد کردن ست و تکرار/ثانیه، و شمارندهٔ تغییرها و مجموع ست‌ها. |
| چالش روزانه | `www/js/challenges.js`، `homeChallenge` در `www/js/app.js` | ۳۰ چالش برای هر سطح (از آزمون سطح). انتخاب با `dateSeed % طول فهرست` و ثابت در طول روز؛ تعویض حداکثر ۲ بار؛ زنجیرهٔ روزهای متوالی. وضعیت در `D.ch`. |
| لرزش | تنظیمات ‹ لرزش | مستقل از صدا؛ هنگام ثبت ست، پایان تایمر و چالش. |
| ادغام تاریخچه | `mergeHistory` در `www/js/app.js` | فایل JSON با `"kinetix": "history"` و آرایهٔ `log` از «تنظیمات ‹ بازگردانی» فقط به آمار اضافه می‌شود و داده‌های دیگر را پاک نمی‌کند؛ دوباره وارد کردن تکراری نمی‌سازد. |
| صفحهٔ اصلی | `viewHome` در `www/js/app.js` | تمرین امروز، هفتهٔ جاری، اهداف، میان‌بر حرکات و بخش‌ها، کلید یادآور. |
| تنظیمات | `viewSettings` در `www/js/app.js` | زبان، تم (خودکار/تیره/روشن)، اندازهٔ متن، صدا، یادآور، آزمون سطح، پشتیبان‌گیری. |
| شروع تمرین | `www/js/workout.js` | تایمر استراحت و نگه‌داشتن، لرزش/بوق، روشن ماندن صفحه (Wake Lock)، ثبت ست‌ها در همان تاریخچهٔ آمار. |
| یادآور تمرین | `www/js/notify.js` | `@capacitor/local-notifications`؛ هفتگی، فقط روزهای تمرینی. اعلان پایان استراحت وقتی اپ در پس‌زمینه است. |
| اندازهٔ متن | متغیر `--fs` در CSS | چهار اندازه (۱، ۱٫۱۵، ۱٫۳، ۱٫۵) از «تنظیمات». |
| اشتراک آمار | `www/js/share.js` | کارت PNG برای ۸ بخش + کارت کلی؛ روی خود گوشی با canvas ساخته می‌شود و با `Filesystem` + `Share` ارسال می‌شود. |

افزونه‌های Capacitor: `app`، `preferences`، `filesystem`، `share`، `splash-screen`، `status-bar`، `haptics`، `local-notifications`.
آیکون کوچک اعلان: `assets/android/ic_stat_kinetix.png` (با `python3 scripts/make_notif_icon.py` دوباره ساخته می‌شود) و `scripts/patch-android.mjs` آن را بعد از هر `cap sync` به پروژهٔ اندروید کپی می‌کند.

### محدودیت‌های شناخته‌شده
- روشن ماندن صفحه با Screen Wake Lock وب انجام می‌شود؛ پشتیبانی آن به نسخهٔ WebView دستگاه بستگی دارد (روی دستگاه واقعی تست کنید).
- یادآور هفتگی تکرارشونده است و نمی‌داند امروز تمرین را انجام داده‌اید یا نه.
- در اندروید ۱۲ به بالا اعلان‌های زمان‌بندی‌شده ممکن است چند دقیقه دیر برسند (حالت صرفه‌جویی باتری).
- نتیجهٔ Onboarding طبق فرمول مشخصات است: کسی که هر چهار آزمون را در سطح مبتدی بزند (۲۰ امتیاز) ولی WHtR طلایی داشته باشد (۳۰ امتیاز) مجموع ۵۰ می‌گیرد و «متوسط» می‌شود.

## روش ۱ — بیلد سبک با Gradle CLI (بدون Android Studio)

### پیش‌نیازها (فقط این‌ها)
1. **Node.js 22+**
2. **JDK 21** (مثلاً Temurin)
3. **Android Command-Line Tools** (از صفحهٔ دانلود developer.android.com/studio، بخش «Command line tools only»)

### نصب SDK
```bash
# فایل zip را در ~/android-sdk/cmdline-tools/latest/ باز کنید، سپس:
export ANDROID_HOME=$HOME/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0"
```
در ویندوز به‌جای `export` از `setx ANDROID_HOME ...` یا Environment Variables استفاده کنید.

### ساخت
```bash
npm run setup                 # نصب وابستگی‌ها + ساخت پروژهٔ android + آیکون/اسپلش + sync
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
cd android && ./gradlew assembleDebug      # ویندوز: gradlew.bat assembleDebug
```
خروجی:
```
android/app/build/outputs/apk/debug/app-debug.apk
```
فایل را به گوشی منتقل و نصب کنید (نصب از منابع ناشناس را فعال کنید). بعد از هر تغییر در `www/` یا `locales/`: `npm run sync` و دوباره `assembleDebug`.

## روش ۲ — بیلد ابری رایگان (GitHub Actions)، بدون نصب چیزی روی سیستم
1. پروژه را در یک مخزن گیت‌هاب (خصوصی هم می‌شود) push کنید (شاخهٔ `main` یا `master`).
2. با هر push، workflow در `.github/workflows/build-apk.yml` خودکار اجرا می‌شود (یا از تب Actions دکمهٔ *Run workflow*).
3. بعد از پایان (چند دقیقه): Actions ‹ اجرای آخر ‹ بخش **Artifacts** ‹ `Kinetix-apk` — یا لینک «دانلود APK» در خلاصهٔ همان اجرا.
4. فایل ZIP دانلودشده را باز کنید؛ نسخهٔ نصبی `release/app-release.apk` است (نسخهٔ release، بدون پرچم debuggable). `debug/app-debug.apk` فقط پشتیبان است اگر ساخت release خطا بدهد.

### امضای ثابت (نصب روی نسخهٔ قبلی)
هر بیلد با همان کلید `signing/kinetix.p12` امضا می‌شود (اسکریپت `scripts/patch-android.mjs` آن را به `android/app/build.gradle` اضافه می‌کند). بنابراین نسخهٔ جدید **روی نسخهٔ قبلی نصب می‌شود و دادهٔ اپ حفظ می‌شود**. فقط یک بار، بیلدی که با کلید تصادفیِ قدیمی ساخته شده را باید حذف کنید (قبلش از تنظیمات پشتیبان بگیرید).
> این کلید برای نصب شخصی/دستی است و داخل مخزن قرار دارد؛ مخزن را خصوصی نگه دارید. برای Google Play یک کلید جدا و محرمانه بسازید.

> پوشهٔ `android/` را می‌توانید commit نکنید؛ workflow خودش می‌سازد.

## انتشار (Play Store)
APK دستی برای نصب شخصی است. برای انتشار: `npm run aab` و امضای release با keystore جداگانه و محرمانه (نه `signing/kinetix.p12`). فایل `.jks/.keystore` و رمزهایش را هرگز در گیت قرار ندهید (در `.gitignore` هست).

## قابلیت‌های بومی‌نما
- Splash بدون چشمک سفید (پس‌زمینهٔ `#090b0e` از لحظهٔ اجرا، بسته‌شدن بعد از اولین رندر)، StatusBar تیره/روشن هماهنگ با تم.
- دکمهٔ Back اندروید: بستن پنجره ← بازگشت به صفحهٔ قبل ← در صفحهٔ اصلی خروج از اپ.
- `viewport-fit=cover` + `env(safe-area-inset-*)`، زوم غیرفعال، `user-select: none` روی رابط، بدون اسکرول افقی.
- تغییر زبان (دکمهٔ EN/فا در هدر) با تغییر خودکار `dir` و فونت و ذخیره روی دستگاه.

## تنظیمات جدید
- پروفایل (نام، سن، قد، وزن) در اولین اجرا و در تنظیمات؛ استراحت بین ست‌ها و بین حرکت‌ها در تنظیمات.
