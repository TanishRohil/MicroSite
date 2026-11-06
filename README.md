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
- `googleForm.action` + `fields`: make the on-page form save to Google Forms. Open your form > Get prefilled link, fill dummy values, copy the link, and take each `entry.NNNN` ID for name, email, college and interests. Set `action` to the form URL with `/viewform` replaced by `/formResponse`. Until this is set, the form runs in preview mode and says so after submit.
- `interestFormUrl`: optional public Google Form link, shown as a fallback link.
- `festStart`: confirmed start date and time (e.g. `2026-12-12T09:00:00+05:30`). This starts the countdown, fills the date chip and turns on Add to calendar.
- Replace TBA text, the tentative event names (Battle of Sound, Dance Off, Stage & Street, Open Mic, Pro Night, Fest Zone, Fest Crew, Cause Drive) and placeholder tiles once the organising team confirms them.
- Add real contact email/phone and social URLs in the FAQ section of index.html (remove `data-pending` from each social link).
- Paste the Search Console verification meta tag in the head.

## Analytics events
`experience_select` (experience), `event_open` (event_name, experience), `interest_section_click`, `register_intent_click` (method), `interest_submit` (experiences), `add_to_calendar`. Mark `interest_submit` as the key event. Register `experience` and `event_name` as event-scoped custom dimensions.

## Deploy on Vercel
Upload these files to a GitHub repo with index.html at the root, import into Vercel with the "Other" preset and no build command. Test with
`?utm_source=instagram&utm_medium=social&utm_campaign=xpressions_2026&utm_content=story_a`
