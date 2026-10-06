# Ben Auto Garage — Web App

Landing page for the QR code: pick **Rescue** or **Door-to-Door**, enter
name + phone, and the client gets an automatic WhatsApp message asking
for their location. Everything after that (mechanic assignment, the
"your mechanic is X" reply) is handled manually by the team on the
business WhatsApp number — no dashboard needed.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in Twilio credentials
npm run dev
```

Visit `http://localhost:3000`.

## What's here

- `app/page.js` — the landing page + form + confirmation screen (all client-side state, no routing needed)
- `app/api/request/route.js` — receives the form submission, logs it, and triggers the WhatsApp message
- `app/api/vehicles/route.js` — looks up vehicle makes/models from NHTSA vPIC on demand; no vehicle catalogue database is stored in the app
- `lib/whatsapp.js` — sends the location-request message via Twilio's WhatsApp API
- `.env.example` — Twilio WhatsApp credentials to fill in

## Before going live

1. **WhatsApp sending**: sign up for [Twilio WhatsApp](https://www.twilio.com/docs/whatsapp) (or swap `lib/whatsapp.js` for Meta's Cloud API / 360dialog if you prefer). Fill in `.env.local`.
2. **Deploy**: push this to GitHub, connect it to [Vercel](https://vercel.com), add the same env vars there. You'll get a live URL to point your QR code at.
3. **QR code**: generate one pointing at your live URL (e.g. via [qr-code-generator.com](https://www.qr-code-generator.com) or the `qrcode` npm package).
4. **Team monitoring**: make sure whoever's on shift is watching the business WhatsApp number for incoming location pins — that's the handoff point where the app stops and manual dispatch begins.

## Later, if you want it

- A record of requests beyond server logs → swap `logRequest()` in `app/api/request/route.js` for a real write to Postgres or SQLite.
- Actually AI-generated (rather than templated) location-request wording → call the Claude or GPT API inside `lib/whatsapp.js` instead of the static template.


## Vehicle autocomplete

The request form now asks for the client's vehicle make and model. Typing a make such as `Lexus` shows live suggestions, and choosing the make enables model suggestions such as `RX`, `LX`, `GX`, and other models available from the vehicle catalogue. The app does not store the full catalogue in its own database. An internet connection is required for live suggestions; if the catalogue is temporarily unavailable, the client can still type the make and model manually.


## WhatsApp requests
Customer requests use WhatsApp click-to-chat (Plan A) and open `https://wa.me/254115412216` with the request details pre-filled. The customer must press Send. No Twilio credentials are required for this flow.
