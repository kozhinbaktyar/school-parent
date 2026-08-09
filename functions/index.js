const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

const STATUS_MESSAGES = {
  present: (name) => ({ title: "✅ ئامادەبوون", body: `${name} گەیشتە قوتابخانە` }),
  absent: (name) => ({ title: "❌ ئامادەنەبوون", body: `${name} ئەمڕۆ نەهاتووە بۆ قوتابخانە` }),
  "forgot-card": (name) => ({ title: "🔵 کارت بیرچوون", body: `${name} کارتەکەی بیرچووە، بەڵام ئامادەیە` }),
  leave: (name) => ({ title: "🟡 مۆڵەت", body: `${name} ئەمڕۆ مۆڵەتی وەرگرتووە` }),
};

// دەکرێت هەر کاتێک تۆمارێکی attendance/{day}/records/{cardId} دروست یان نوێ بکرێتەوە
exports.onAttendanceChange = functions.firestore
  .document("attendance/{day}/records/{cardId}")
  .onWrite(async (change, context) => {
    // ئەگەر تۆمارەکە سڕدرابێتەوە، هیچ مەکە
    if (!change.after.exists) return null;

    const after = change.after.data();
    const before = change.before.exists ? change.before.data() : null;

    // ئەگەر دۆخەکە نەگۆڕابێت (وەک نوێکردنەوەی تەنیا فیلدێکی تر)، notification مەنێرە
    if (before && before.status === after.status) return null;

    const messageBuilder = STATUS_MESSAGES[after.status];
    if (!messageBuilder) return null; // دۆخێکی نەناسراو

    const cardId = context.params.cardId;

    const studentSnap = await db.doc(`students/${cardId}`).get();
    if (!studentSnap.exists) {
      console.warn(`قوتابی بەم cardId نەدۆزرایەوە: ${cardId}`);
      return null;
    }
    const student = studentSnap.data();
    const { title, body } = messageBuilder(student.name || "قوتابی");

    const tokensSnap = await db.collection(`students/${cardId}/parentTokens`).get();
    if (tokensSnap.empty) return null; // هیچ باوانێک تۆکنی تۆمار نەکردووە

    const tokens = tokensSnap.docs.map((d) => d.id);

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      webpush: {
        fcmOptions: { link: "/" },
        notification: { icon: "/icons/icon-192.png" },
      },
    });

    // سڕینەوەی تۆکنە کۆن/نادروستەکان تاکو داتابەیس پاک بمێنێتەوە
    const staleTokens = [];
    response.responses.forEach((r, idx) => {
      if (
        !r.success &&
        (r.error?.code === "messaging/registration-token-not-registered" ||
          r.error?.code === "messaging/invalid-registration-token")
      ) {
        staleTokens.push(tokens[idx]);
      }
    });
    if (staleTokens.length > 0) {
      await Promise.all(
        staleTokens.map((t) => db.doc(`students/${cardId}/parentTokens/${t}`).delete())
      );
    }

    console.log(
      `Notification bo ${student.name}: ${response.successCount} sarkawtu, ${response.failureCount} shikst`
    );
    return null;
  });
