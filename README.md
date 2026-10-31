# websiter
website

## Firebase Authentication

The sign-in page uses Firebase Authentication for email/password and Google sign-in.

1. Create a Firebase project and register a web app in the Firebase console.
2. In Authentication, enable the Email/Password and Google providers.
3. Add the page's host (for local testing, `localhost`) to Authentication's authorized domains.
4. Copy the web app configuration into the `firebaseConfig` object in `index.html`, replacing the `YOUR_FIREBASE_*` values.
5. Serve the page over HTTP, such as with `python3 -m http.server 8000`, then open `http://localhost:8000`.

The Firebase web configuration is public client configuration, not a private service-account key. Do not put service-account credentials in this page. Any future API that protects user data should verify Firebase ID tokens on the server.
