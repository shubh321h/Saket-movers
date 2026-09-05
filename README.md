# Saket Packers & Movers — Google Review QR

A mobile-first, one-page review assistant. A customer scans the printed QR,
picks a star rating, chooses the service and what they liked, gets a freshly
written review they can edit, and is taken to the exact Google review page for
the business. **Nothing is ever posted automatically — the customer always
presses Google's Post button themselves.**

- No login, no signup, no admin panel, no database.
- No analytics, no tracking, nothing uploaded. Everything stays on the device.

## Routes

| Route      | Purpose                                                          |
| ---------- | ---------------------------------------------------------------- |
| `/review`  | The customer flow. This is what the QR encodes.                  |
| `/qr`      | Owner-only printable QR sheet. Not linked from the site.         |
| `/`        | Redirects to `/review` so the standalone build works.            |

The QR address is **fixed on purpose** and is not editable in the UI:

```
https://saketpackers.vercel.app/review
```

Set in one place: `BUSINESS.reviewPage` in `src/lib/data.ts`.

## Adding this page to an existing site

The customer page is self-contained, so it can be dropped into any existing
React project (for example `saketmovers` publishing `saketpackers.vercel.app`):

1. Copy `src/components/`, `src/lib/`, `src/pages/ReviewFlow.tsx` and
   `src/pages/QrPage.tsx` into your project.
2. Add the two routes to your router:

   ```tsx
   <Route path="/review" element={<ReviewFlow />} />
   <Route path="/qr" element={<QrPage />} />
   ```

   Do not add either route to your site navigation — the page is meant to be
   reached only by the direct URL or by scanning the QR code.

3. Install the two dependencies:

   ```bash
   npm install qrcode @types/qrcode framer-motion lucide-react
   ```

4. Merge the `@theme` block from `src/index.css` into your global stylesheet so
   the gold/ink design tokens resolve.
5. Serve the app over HTTPS — browsers only allow clipboard writes on secure
   origins, and that is what lets the review be pasted into Google.

## Google review destination

The business is resolved from the owner's own Maps share link
(`https://maps.app.goo.gl/pS6FZHudLgQkaoXh7`), whose CID is
`0x399a0716e15b8403:0xf323df28e001581`.

That decodes to the permanent place ID `ChIJA4Rb4RYHmjkRgRUAjvI9Mg8`, which was
round-trip verified against Google before use. It drives the official endpoint:

```
https://search.google.com/local/writereview?placeid=ChIJA4Rb4RYHmjkRgRUAjvI9Mg8
```

Defined in `BUSINESS.placeId` (`src/lib/data.ts`) and `GOOGLE_REVIEW_URL`
(`src/lib/google.ts`).

## How reviews are written

`src/lib/generate.ts` assembles each draft from a randomly chosen structural
shape plus large swappable sentence pools, with shuffled attribute order,
variable sentence count and optional sign-off punctuation.

- It can only describe what the customer actually tapped — no names, prices,
  distances, dates or incidents are ever invented.
- Drafts are checked against local history and a session set using blended
  unigram/bigram Jaccard similarity; close matches are discarded and rebuilt.
- Ratings of 3 or below switch to an honest, constructive tone and offer an
  optional "what could be better" step.

## Local development

```bash
npm install
npm run dev      # http://localhost:5173/review
npm run build    # production build in dist/
```

## Deploying

Push to your repo and let Vercel build it, or deploy this folder directly:

```bash
npx vercel --prod
```

`vercel.json` already contains the SPA rewrite so `/review` and `/qr` resolve
on a hard refresh or a direct scan.
