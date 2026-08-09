# ئەپی باوان - ئامادەبوونی منداڵەکەم (PWA)

## پێکهاتەی پڕۆژەکە
```
parent-app/
├── public/                      ← ئەپی باوان (PWA) — بلاوی دەکەیتەوە
│   ├── index.html
│   ├── manifest.json
│   ├── firebase-messaging-sw.js
│   └── icons/
├── functions/                   ← Cloud Function — دەیخەیتە سەر Firebase
│   ├── index.js
│   └── package.json
└── firestore.rules              ← ڕێساکانی ئاسایشی Firestore
```

## هەنگاوەکانی دامەزراندن

### ١. چوونە پلانی Blaze
لە [Firebase Console](https://console.firebase.google.com) → پڕۆژەکەت → Settings → Usage and billing → گۆڕین بۆ پلانی **Blaze** (pay-as-you-go). Cloud Functions لەسەر پلانی بەخۆڕایی کارناکات، بەڵام بۆ قوتابخانەیەکی بچووک زۆر بەرزی لە ڕادەی بەخۆڕاییدا (٢ ملیۆن بانگکردن مانگانە) نامێنیت — واتە لە پراکتیزەدا هیچ پارەیەک نادەیت.

### ٢. وەرگرتنی VAPID Key
Firebase Console → Project settings → Cloud Messaging → **Web Push certificates** → "Generate key pair".
ئەم کلیلە کۆپی بکە و لە `public/index.html` بیخەرە شوێنی:
```js
const VAPID_KEY = "PASTE_YOUR_VAPID_KEY_HERE";
```

### ٣. دامەزراندنی Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### ٤. Deploy کردنی Cloud Function
```bash
cd parent-app/functions
npm install
cd ..
firebase deploy --only functions
```

### ٥. Deploy کردنی Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### ٦. بلاوکردنەوەی ئەپی باوان (public/)
دوو ڕێگات هەیە:

**هەڵبژاردنی ١ (پێشنیارکراو) — Firebase Hosting:**
```bash
firebase init hosting   # public directory: parent-app/public
firebase deploy --only hosting
```
notification و PWA باشترین کارایی وەردەگرن لەگەڵ Firebase Hosting.

**هەڵبژاردنی ٢ — GitHub Pages** (وەک پڕۆژەکانی پێشووت):
پێویستە فایلەکانی ناو `public/` بخەیتە ڕیشەی repo‌ی GitHub Pages‌ەکەت. تەنیا تێبینی: notification لەسەر iOS پێویستی بە Safari 16.4+ هەیە و دەبێت ئەپەکە یەکەم جار بە "Add to Home Screen" زیاد بکرێت (نەک تەنیا لە Safari کراوە بێت).

## سنووردارییەکانی ئاسایشی (گرنگ)
ئەم سیستەمە هیچ Firebase Authentication‌ی ڕاستەقینەی تێدا نییە — نە بۆ panel، نە بۆ سکانەر، نە بۆ ئەپی باوان. `firestore.rules` بە شێوەیەکی کراوە دانراوە تاکو هیچ کام لەم ئەپانە نەوەستێت. ئەمە بۆ پڕۆژەیەکی ناوخۆیی/قوتابخانەیەکی بچووک قبوڵکراوە، بەڵام ئەگەر بتەوێت ئاستێکی بەرزتری ئاسایشی هەبێت، هەنگاوی داهاتوو دەبێتە:
- Firebase Auth (email/password) بۆ panel و سکانەر
- سنووردارکردنی نووسینی `students` و `attendance` بۆ تەنیا بەکارهێنەرانی ڕاستەقینەکراو

## تاقیکردنەوە
1. لە مۆبایلی باوان، `index.html` بکەرەوە → "زیادکردنی منداڵ" → ژمارەی کارتی RFID بنووسە.
2. "چالاککردن"ی notification بکە.
3. لە panel یان سکانەرەکە دۆخی ئەو قوتابییە بگۆڕە (بۆ نموونە "هاتوو").
4. لە ماوەی چەند چرکەیەکدا، notification دەبێت بگاتە مۆبایلی باوان.
