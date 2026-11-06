# Find Your X | Xpressions microsite (Step 3)

Static HTML, CSS and JavaScript microsite built from Group 4's Step 2 deck: ink navy, warm ivory and electric coral, the split X campaign imagery, and the Find Your X homepage concept. Anton (headlines) and Onest (body) stand in for TT Firs Neue via Google Fonts.

## Sections
1. Home | proposition, split X hero visual, status chips (venue, dates, registration), countdown, CTAs
2. Find Your X | competitions, performances, speakers and attractions, filterable by Compete / Perform / Watch / Give back; each card opens a "Before you commit" checklist
3. Highlights | previous edition clip, event images, campaign posters, placeholder tiles for real photos and the aftermovie
4. Plan your visit | tentative 3-day programme, venue card, Maps link, travel, stay and entry info
5. Participation | visitor journey, Register My Interest form with acknowledgement, "when registrations open" CTAs
6. FAQs, contact details and social links

## Hero slideshow
Edit `heroSlides` in site.js. Each slide has `image` (put files in assets/), `position` (background-position to keep faces in frame), `top` and `bottom` (the two-part caption) and `label` (the small tag by the dots). Slides change every `SLIDE_MS` (6000 ms). Portrait or square images around 1200px tall work best.

## Before launch (edit `settings` at the top of site.js)
- `measurementId`: GA4 web stream ID (G-XXXX).
- **Google Form (interest):** open https://script.google.com, create a new project, paste `tools/create-google-form.gs`, run `createXpressionsForm`, then copy the printed `interestFormUrl` and `googleForm` block into the settings at the top of site.js. The on-page form then sends name, email, college and each selected event straight into the Google Form (Responses > Link to Sheets for a spreadsheet). Until this is set, the form runs in preview mode and says so after submit.
- `interestFormUrl`: optional public Google Form link, shown as a fallback link.
- `festStart`: currently a tentative date (17 to 19 Jan 2027). Replace with the confirmed start. It drives the countdown, the date chip, the hero eyebrow and both Add to calendar options (Google Calendar link and .ics file).
- `visitCounter`: free Abacus counter (abacus.jasoncameron.dev). Every page open adds 1 and shows the total under Site visits. Change the namespace/key in the URL to start a fresh count.
- Events in the Find Your X carousel are real Xpressions events from past editions (2016 to 2024 coverage), sorted into Compete, Perform, Watch and Give back. Confirm which run this edition and update `events` in site.js.
- Past-edition photos in Blast from the Past are linked from news sites (PaGaLGuY, Youth Incorporated, OfficeChai, XIM University). If one fails to load, a local illustration shows instead. For permanence, download originals into assets/ and point the img src at them.
- Add real contact email/phone and social URLs in the FAQ section of index.html (remove `data-pending` from each social link).
- Paste the Search Console verification meta tag in the head.

## Analytics events
`experience_select` (experience), `event_open` (event_name, experience), `interest_section_click`, `register_intent_click` (method), `interest_submit` (experiences), `add_to_calendar`. Mark `interest_submit` as the key event. Register `experience` and `event_name` as event-scoped custom dimensions.

## Deploy on Vercel
Upload these files to a GitHub repo with index.html at the root, import into Vercel with the "Other" preset and no build command. Test with
`?utm_source=instagram&utm_medium=social&utm_campaign=xpressions_2026&utm_content=story_a`
