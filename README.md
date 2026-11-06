# Find Your X

A static HTML, CSS and JavaScript microsite based on Group 4’s Xpressions Step 2 deck. The images are illustrative crops from the deck’s homepage concept. The site uses system fonts as a fallback for TT Firs Neue.

## Preview and deploy

Open index.html locally. For Vercel, upload the extracted files to a GitHub repository with index.html at the root. Import that repository into Vercel using the Other framework preset and no build command. Share the production URL after testing.

## Before campaign launch

- In site.js, fill in measurementId with your GA4 Web stream ID and interestFormUrl with the confirmed Google Forms respondent link.
- Replace TBA entries and add verified contact and social links as the organisers confirm them. Treat the supplied past-event examples as illustrative until independently verified.
- Add the Search Console URL-prefix verification tag to the head in index.html and redeploy before verifying.
- Open the production URL on mobile with test UTM tags. Verify page_view, experience_select and register_intent_click in GA4 Realtime. Mark register_intent_click as a key event. The interest_section_click event measures navigation to the participation section.
- For breakdowns of experience_select by experience, register the experience event parameter as an event-scoped custom dimension in GA4.
- Count completed submissions separately in Google Forms. The form link click measures intent to open the form, and the campaign attribution on site does not automatically carry through to form submissions.

Example campaign suffix

`?utm_source=instagram&utm_medium=social&utm_campaign=xpressions_2026&utm_content=story_a`
