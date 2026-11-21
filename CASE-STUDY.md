# Case study: a salon landing page with online booking

*Portfolio sample. The salon, prices and details are made up; everything listed under "What it does" and "Proof" is real and tested.*

**Example scenario.** A small hair salon takes bookings by phone, so calls interrupt appointments and people who look the salon up in the evening can't book at all. The owner wants a simple page that shows the prices and lets people ask for a time.

**What I built.**
- A one-page site with the service menu, prices, opening hours and a clear "Book a visit" button.
- A booking form that checks each request before accepting it, and explains any problem in plain English.
- A calm lavender-and-grey look with elegant headings, built mobile-first.

**What it does.**
- Refuses closed days, past days, days too far ahead, and Saturday evening slots after closing time.
- Uses the salon's own time zone, so "today" is always the salon's today.
- Keeps everything the visitor typed when something needs fixing.
- Works on phones, with keyboards and screen readers, and even with JavaScript turned off.
- Blocks simple spam bots without making people solve a puzzle.

**Proof.** 51 automated tests. A script plants 14 deliberate bugs, one at a time, and all 14 are caught. Checked in a real browser at laptop and phone sizes, with and without JavaScript.

**Stack.** Next.js, React, TypeScript, Vitest. Comes with a README and setup steps.
