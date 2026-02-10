const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("./db");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      const googleId = profile.id;
      const name = profile.displayName;
      const email = profile.emails?.[0]?.value || null;

      pool.query(
        "SELECT * FROM google_users WHERE google_id = ?",
        [googleId],
        (err, results) => {
          if (err) return done(err);

          if (results.length > 0) {
            return done(null, results[0]);
          } else {
            pool.query(
              "INSERT INTO google_users (google_id, name, email) VALUES (?, ?, ?)",
              [googleId, name, email],
              (err, result) => {
                if (err) return done(err);

                return done(null, {
                  id: result.insertId,
                  google_id: googleId,
                  name,
                  email,
                });
              },
            );
          }
        },
      );
    },
  ),
);
