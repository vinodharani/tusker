# Firebase setup (one-time, ~5 minutes)

Tusker uses the **Firebase free (Spark) plan** — no credit card, no servers to maintain.

1. Go to https://console.firebase.google.com and click **Add project**
   (name it e.g. "tusker"; disable Google Analytics if you don't want it).
2. In the project, click the **Web** icon (`</>`) to add a Web app.
   Firebase shows you a `firebaseConfig` object — copy those values into
   `firebase-config.js` in this folder, replacing each `PASTE_...` placeholder.
3. Enable anonymous sign-in:
   **Build → Authentication → Get started → Anonymous → Enable → Save.**
4. Create the database:
   **Build → Firestore Database → Create database → Production mode →**
   pick any region → Enable.
5. Set security rules (**Firestore → Rules**) so only your household docs
   can be used:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /households/{householdId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

   (Anonymous users are still authenticated; the unguessable household code
   plus these rules is adequate protection for a private family app.)

6. Reload Tusker → menu (`⋯`) → **☁️ Sync across devices…** →
   **Create household**. You'll get a code like `tusker-k3m9xq2p`.
7. On your wife's phone or laptop browser: open Tusker → menu → sync →
   **Join with a code** → enter the code. Done — every change now appears
   on all paired devices within about a second.

## Notes

- Each device keeps a local copy in localStorage, so Tusker opens instantly
  and still works offline; changes push automatically when back online.
- Conflicts are resolved last-writer-wins (fine for two people logging
  cleanings). Use **Export backup** for an occasional manual safety copy.
- Free-tier usage here is negligible (a few writes per day).
