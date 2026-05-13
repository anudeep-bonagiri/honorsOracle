# Honors Oracle — Future Plans

This document is the long version of where I want to take Honors Oracle and how I think we get there. It exists because the chat as it stands today is a useful reference tool, but a reference tool is not a daily product, and a side project that students use once a semester is not a fundable thing. If this is going to go big, the path needs to be written down. So here it is, written down.

Last updated: 2026-05-13. Author: Anudeep Bonagiri, sophomore, UTSA Honors CS.

---

## Where the product is right now

The chat is live at utsa-student-oracle.vercel.app. It pulls from a knowledge base of UTSA Honors policy (ELA, SPICE, thesis, graduation, scholarships, research routes) and streams answers from Groq's Llama 3.1. Edge function on Vercel, static frontend, no database, no auth.

What it does well today:
- Answers specific policy questions accurately and fast.
- Doesn't hallucinate items inside its knowledge base.
- Says "I don't know" instead of guessing when something falls outside its scope.

What it does not do yet, and why that matters:
- No memory across sessions. Every chat starts cold.
- No proactive surface. If you don't open the page, you never hear from it.
- No tracking of anything personal — your ELA points, your scholarship drafts, your deadlines.
- No mobile install path. It's a browser bookmark people forget.

The honest read: students who try it find it useful, then use it once when they have a specific question, then it falls off their radar. That is a search tool, not a product. The rest of this document is about closing the gap between those two things.

---

## The single thing that has to change

A student opens a daily app for one of two reasons. Either the app pushed them ("Goldwater campus deadline in 21 days, you haven't started"), or they have a habit attached to it ("I always check my ELA count after a Service event"). Anything else is a tool they use when they remember it exists.

Neither push nor habit is true for Honors Oracle today. Everything in Phase 1 below is in service of making at least one of those two things real.

---

## Phase 1: the five core builds

These five, shipped in roughly this order, are what turn a search tool into a product students keep on their home screen.

### 1. User profiles (foundational)

Right now the chat has amnesia. Every session is a stranger meeting a stranger. That has to end before anything else makes sense.

What to build:
- Sign-in via Google. UTSA accounts use Google Workspace, so the friction is one tap.
- Profile fields read into the system prompt on every chat request: year, major, GPA range, scholarships of interest, completed ELA activities, target external programs.
- Optional richer fields: thesis advisor, research lab, research interests, intended grad path.

What it unlocks:
- Sharper, personal answers. "Which scholarships should I apply for" stops being a catalog and becomes a list of four specific programs a sophomore CS student at 3.7+ should actually be working on.
- The bot remembers across sessions. You don't have to re-explain who you are.
- The foundation every other Phase 1 build depends on. None of the radar features below are possible without it.

Scope: 2 to 3 days of focused work. Supabase for auth and the user table, a small profile form, pass the profile blob into the system prompt server-side.

Honest risks:
- Students don't sign up because there is no immediate value before they sign up. Mitigation: keep the anonymous chat fully functional. Sign-in unlocks the proactive features, but you can still get an answer without it.
- Privacy. Storing GPA ranges and major needs a clear data policy. Use the principle: store the minimum, never sell, delete on request.

### 2. Deadline radar (the killer feature)

The knowledge base already contains every major scholarship and ELA deadline. Once profiles exist, the bot can match those deadlines to actual humans who care about them.

What to build:
- A daily cron job that walks all active profiles, checks against a structured deadline table, and queues notifications when a deadline is N days out (configurable per user).
- Email notification: "Goldwater campus deadline in 21 days. You have nothing drafted. Want help starting the essay?"
- In-app banner on next open: "3 deadlines this week relevant to you."
- A simple user-facing settings screen: which deadlines to track, what lead times to push (default 30 / 14 / 7 / 1 days).

What it unlocks:
- This is the single biggest reason students open this every week instead of every semester.
- It solves a real and painful problem. Most students who would have applied to Goldwater or Truman miss it not because they were unqualified, but because they did not know about it in time.

Scope: 2 days. Vercel cron + Resend (or similar) for transactional email + a deadlines table normalized from the knowledge base.

Honest risks:
- False positives kill trust. The bar for a push has to be high. Be conservative early; expand later.
- Deadlines change. Need a small admin UI for me to correct dates without re-deploying.

### 3. ELA tracker

ELA tracking happens in the Honors portal today, which is clunky and easy to forget about. Students lose track between events and either over-document or fail to file at the deadline.

What to build:
- A simple in-app form to log an ELA activity: name, date, SPICE track, optional notes.
- A running total per track, with a target line for the graduation requirement.
- A "What's the gap?" view that says specifically which tracks need more activity.
- Stretch: pre-fill the Honors portal budget-request form from the logged activity, so submission is two clicks instead of fifteen.

What it unlocks:
- Concrete daily-touch utility. Students update this every time they go to something Honors-related.
- Becomes the natural first place students check before any Honors-relevant decision.

Scope: 3 days. Mostly CRUD, plus a chart.

Honest risks:
- Low. This is straightforward to build. The risk is feature creep — keep it simple. Log, count, gap. Nothing more in v1.

### 4. PWA, installable, with push notifications

Right now the product is a browser tab people have to remember to bookmark. Bookmarks die. Home-screen icons do not.

What to build:
- Service worker for offline-ready static assets.
- manifest.json with icons, theme color, display: standalone.
- An install prompt that fires after the user has had two productive sessions (not on first visit; that is desperate).
- Web Push API permission flow, separate from install, gated on "you have a profile."

What it unlocks:
- Home-screen icon roughly quadruples open rate compared to a bookmark.
- Push notifications make the deadline radar work in real time, not just via email.
- Costs nothing. No app store, no review, no certification.

Scope: 1 day for the PWA shell, 2 more for push notifications working reliably across iOS and Android.

Honest risks:
- iOS Safari did not support PWA push until 16.4. Most students have newer phones, but document the limitation and offer email as a fallback always.
- Push is easy to overuse. Cap at three pushes per user per week unless they explicitly opt up.

### 5. The Monday Brief

Once profile + deadlines + ELA + PWA are in place, the brief is the smallest amount of new code and the biggest behavior shift.

What to build:
- Cron at 7am Central every Monday.
- Per-user synthesis: deadlines coming up this week, Monday Message highlights filtered to your scholarships, one suggested action for the week, ELA gap if there is one.
- Delivered three ways: push notification, email, in-app banner on next open.

What it unlocks:
- The habit. This is the morning-coffee thing — the Twitter replacement for Honors-related life.
- The "daily-use" claim becomes credible to administrators and donors, because it is now true.

Scope: 2 days, mostly prompt engineering for the synthesis step and templating for the email.

Honest risks:
- A bad brief gets unsubscribed. The first three weeks need to be genuinely good, or this feature dies on arrival. Plan to iterate weekly on open and click rates.

---

## Phase 2: the deeper features

These are powerful but should not start until Phase 1 has metrics that prove it works. Building Phase 2 first would be the classic side-project failure mode.

### Application companion

For the high-effort scholarships — Goldwater, Fulbright, NSF GRFP, Truman — each application is a six-month process. The Oracle could hold drafts in version history, run iterative review against the published rubric, track milestones, and remind users of the campus deadline (which is usually four to eight weeks earlier than the national one and is where most people lose). This is weeks of work, not days. It also locks in users for a long retention cycle if it works. Worth building once Phase 1 metrics justify it.

### Cohort and social proof

Daily apps live on network effects. The Oracle could surface "12 other Honors students looked into Beinecke this week," allow users to save and share answers with study groups, recommend "students like you ended up applying to X." This is the highest retention multiplier if it works, but also the highest complexity. Privacy decisions need to be made carefully — students will hate this if it feels surveilled. Worth doing once we have enough users to make the cohort signal meaningful, not before.

### Calendar feed

Every Honors deadline as an .ics subscription URL. Students subscribe once in Google Calendar or Apple Calendar and the deadlines show up where they already live. This is one day of work and high trust. Easy win once Phase 1 ships.

### Voice input on mobile

"Hey Oracle, what is the SPICE Service requirement again?" — a five-second interaction, faster than texting a friend. Web Speech API on mobile is good enough for this now. One day of work for a basic version. Mostly a polish item.

### Class and professor recommender

"I'm a sophomore CS major, which classes should I take next semester to stay on Honors track and position myself for Goldwater?" This needs UTSA course-catalog data and Honors-section flagging. The hard part is data ingestion, not the chat. Weeks of work, dependent on either scraping or a partnership for catalog data.

### Knowledge base for other Honors colleges

The current knowledge base is hand-written for UTSA. Scaling to other schools means a maintainable pipeline: pull from each school's handbook, parse, structure, version. This is the engineering project that unlocks the licensing path described later. Plan on it taking a quarter of focused work, with the first replication school giving us the template.

---

## Build sequence and rough timeline

| Week | Focus | Outcome at end of week |
|------|-------|------------------------|
| 1 | Profile + Google auth | Users can sign in and personalize |
| 2 | ELA tracker (log, count, gap) | First real utility for return visits |
| 3 | PWA shell + manifest + install prompt | Home-screen presence |
| 4 | Email deadline radar | First proactive push |
| 5 | Web Push via the PWA | Real-time push working on Android, opt-in iOS |
| 6 | Monday Brief end-to-end | The habit loop is complete |
| 7 | Telemetry pass — fix what's broken | Numbers honest, not aspirational |
| 8 | Calendar feed + voice input polish | Phase 1 fully shipped |

This assumes evenings and weekends. I'm a full-time student, so real velocity is probably half what is on this table. Plan accordingly.

---

## What success actually looks like

The metrics that matter, in order of how much they tell us:

1. **Weekly active users divided by total signed-up users.** The cleanest daily-use proxy. Target after week 8: greater than 50 percent.
2. **D7 retention of new signups.** Do users come back a week after signing up. Target: greater than 40 percent.
3. **Push opt-in rate among installed-PWA users.** Without this, the radar is just email. Target: greater than 60 percent.
4. **Average sessions per weekly-active user.** Quality of the engagement, not just presence. Target: greater than 4.
5. **Deadline radar conversion.** Did users open the push or email, and did they take action. Target: open above 35 percent, downstream action above 15 percent.

If those numbers land within range after Phase 1, this is a fundable and licensable product. If they don't, the right answer is not "spend on marketing." The right answer is to rebuild the core loop. Marketing on top of a broken loop is the most common way side projects waste money.

---

## The longer scale path

If retention holds at UTSA, the same product is deployable to roughly 330 Honors programs across the US. Each Honors program has the same underlying problem: dense policy, fragmented knowledge, students who miss opportunities they would have qualified for.

The replication play looks like this:
- Each Honors college runs its own configured knowledge base for that school's policies.
- Same chat infrastructure, same profile system, same deadline radar.
- Per-school analytics for advisor offices: "students are asking about X repeatedly — your handbook section on X is unclear."
- Annual contract per institution. Probably four-figure annual SaaS pricing per school for a tool that touches every Honors student.

But step one is making it work for one school, hard, before chasing the multi-school dream. Skipping that step is how a side project dies. UTSA first. Other schools when the metrics earn it.

---

## What this needs

Time: roughly two months of focused evening-and-weekend work to ship Phase 1.

Infrastructure cost at small scale, monthly:
- Supabase auth and database: ~$0 to $25 depending on usage
- Vercel hosting and edge functions: ~$0 to $20
- Resend or Postmark for transactional email: ~$10
- Domain and SSL: ~$1.25 amortized
- Groq API: pay-per-call, currently low. If usage scales 100×, ~$100

Total monthly run cost at the scale Phase 1 plans for: under $100.

Help that would unlock specific things:
- A UTSA Honors advisor willing to review the knowledge base for accuracy — about two hours of their time, no money.
- Access to the official Honors scholarship deadline calendar, even an out-of-date PDF — also a no-cost ask.
- Five UTSA Honors students willing to use the product weekly during week-1 testing and tell me what's broken.

If anyone reading this is in a position to help with one of those three, the mailto at the bottom of utsa-student-oracle.vercel.app works.

---

## Honest caveats

This is a side project run by one undergrad. None of the timelines above account for the fact that I am also a full-time CS student carrying a normal courseload. Real velocity is probably half of what is on the table above.

The roadmap also assumes UTSA Honors does not at some point ask me to take this down. I am not affiliated with the Honors College and do not claim to be. The chat says "unofficial" everywhere it can. It always links to the official source. It says "I don't know" rather than guessing on high-stakes information. If at some point the Honors office wants this to become an official tool, that is a conversation worth having. If they would rather it stay unofficial, that is also fine, as long as it stays useful.

Finally: every product roadmap is a guess. This one is grounded in the specific problem students at UTSA Honors actually have, but the order of operations might be wrong, and a couple of features in Phase 1 might turn out to be wrong entirely once the first real metrics come in. That is fine. The point of writing it down is to commit to a hypothesis specific enough to be proven wrong, not to pretend the future is already known.

---

Anudeep Bonagiri
UTSA Honors CS, sophomore
anudeep.bonagiri@gmail.com
