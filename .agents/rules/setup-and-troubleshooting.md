# Setup and Troubleshooting Guide

## Mobile & Device Connection
- When debugging on a physical Android device connected via USB:
  - The mobile app connects to `http://localhost:3000`.
  - ADB port 3000 must be reversed (`adb reverse tcp:3000 tcp:3000`).
  - `npm run android` in `mobile/` runs `scripts/run-android.js` which automatically maintains this port reversal.
  - Run `npm run reverse` in `mobile/` if USB is reconnected.


## Backend Database
- PostgreSQL is used with Drizzle ORM.
- Tables include `user`, `account`, `session`, `verification`, `business`, `branch`, `sale`, and `expense`.
- Run `npm run db:migrate` in `backend/` to apply new migrations.
- Run `npm run db:generate` in `backend/` after modifying `src/db/schema.ts`.

## Better Auth Configuration
- Auth scheme is `networth://`.
- In `authClient.signIn.social(...)`, both `callbackURL` and `errorCallbackURL` must resolve to valid URIs matching `trustedOrigins` (use `Linking.createURL`).
- `trustedOrigins` in `backend/src/config/auth.ts` must contain `networth://*`, localhost ports, and local IP.
