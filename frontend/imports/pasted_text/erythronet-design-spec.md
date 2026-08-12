# DESIGN ERYTHRONET — PREMIUM EMERGENCY BLOOD NETWORK

Design a complete, production-quality UI/UX system and responsive website for **ErythroNet**, a real-time emergency blood request and donor coordination platform for Pakistan.

ErythroNet is an emergency blood coordination network that connects patients/patient attendants who urgently need blood with verified nearby voluntary donors.

This is NOT a generic hospital website, generic healthcare dashboard, or template SaaS product.

The visual concept should communicate:

**URGENT + TRUSTWORTHY + HUMAN + REAL-TIME + MODERN PAKISTANI CIVIC TECHNOLOGY**

The product should look like a serious startup/product that could realistically be launched, not a university "AI-generated/vibecoded" project.

---

# 1. CORE PRODUCT IDEA

The core experience is a **Live Emergency Blood Request Board**.

Users can see verified active blood requests in real time.

Each request communicates:

* Blood group
* Hospital
* District
* Ward/floor
* Units required
* Urgency
* Time elapsed
* Current status
* Donor response

The three critical states are:

🔴 Awaiting Donor
🟡 Donor En Route
🟢 Fulfilled

The most important interaction is:

**I WILL DONATE → ETA → DONOR EN ROUTE → FULFILLED**

The UI must make this state transition visually obvious.

Do not design the product around generic medical imagery. Design it around **coordination, urgency, trust, people, and real-time information**.

---

# 2. VISUAL ART DIRECTION

Create a distinctive design language combining:

### Glassmorphism

Use:

* translucent surfaces
* backdrop blur
* subtle white borders
* layered transparency
* blurred background gradients
* frosted panels

But avoid excessive "glass everywhere".

### Neumorphism

Use subtle soft depth for:

* buttons
* filter controls
* segmented controls
* compact stat widgets
* interactive cards
* toggles
* input containers

Neumorphism must be subtle and accessible.

Do NOT create old-fashioned soft UI with huge shadows.

### Editorial / Premium Typography

Use a strong modern sans-serif typography system.

Suggested direction:

* Display: bold / extra-bold
* Body: highly readable neutral sans
* Numbers: large tabular/statistical typography
* Small metadata: compact uppercase labels with letter spacing

Use typography to establish hierarchy rather than relying entirely on colors.

---

# 3. COLOR SYSTEM

Primary visual foundation:

* Deep crimson
* Dark wine
* Near-black
* Warm off-white
* Soft gray

Suggested conceptual palette:

Primary:
Deep Crimson / Blood Red

Secondary:
Dark Burgundy

Background:
Near-black / charcoal

Light surfaces:
Warm white / very light gray

Glass:
White with low opacity

Status:

Awaiting:
Crimson / red

Donor En Route:
Amber / warm yellow

Fulfilled:
Emerald / green

IMPORTANT:

Do not make the entire interface red.

Red should represent:

* urgency
* action
* blood-related identity
* critical states

Use neutral surfaces for most UI.

Use status colors semantically, not decoratively.

---

# 4. BRAND IDENTITY

Create a simple but memorable ErythroNet logo.

Concept:

A network/bridge connecting two points, subtly combined with:

* blood drop
* heartbeat line
* connection node

Avoid cliché medical logos.

Do not use a generic red blood-drop icon as the entire logo.

Create:

* wordmark: ErythroNet
* compact symbol
* favicon/app icon
* monochrome variant

The identity should work on both dark and light backgrounds.

Brand descriptor:

"Emergency Blood Network"

Hero headline:

"Emergency Blood.
Found in Minutes, Not Hours."

---

# 5. DESIGN PRINCIPLES

The entire product must follow these principles:

1. Emergency information must be visible immediately.
2. Users should understand the interface without instructions.
3. Primary actions must be visually dominant.
4. Avoid unnecessary decorative UI.
5. Every animation should communicate state or provide feedback.
6. Never sacrifice readability for visual effects.
7. Maintain strong accessibility contrast.
8. Use progressive disclosure for secondary information.
9. Optimize the interface for mobile users first.
10. The design must feel trustworthy enough for an emergency.

---

# 6. REQUIRED SCREENS

Create a complete Figma design system and all major product screens.

## PUBLIC EXPERIENCE

### Screen 01 — Landing Page

Full responsive landing page.

Sections:

1. Sticky glass navigation
2. Hero
3. Live emergency counter
4. Problem/statistics section
5. How ErythroNet works
6. Live Request Board preview
7. Impact dashboard preview
8. Trust / verification section
9. Final CTA
10. Footer

Navigation:

Logo:
ErythroNet

Links:

Live Board
How It Works
Impact

Actions:

Log In
Become a Donor

Primary emergency CTA:

Request Emergency Blood

---

# 7. LANDING HERO

Make this the strongest visual section.

Full viewport hero.

Background:

deep crimson-to-black atmospheric gradient with subtle blurred radial light.

Add very subtle abstract network geometry representing connections between donors and hospitals.

Do NOT use stock medical photography.

The background should feel like:

"real-time emergency infrastructure"

rather than:

"hospital website".

Hero content:

Eyebrow:

LIVE EMERGENCY BLOOD NETWORK

Headline:

"Emergency Blood.
Found in Minutes, Not Hours."

Supporting copy:

"Connect verified emergency blood requests with nearby voluntary donors — without the chaos of WhatsApp broadcasts."

Primary CTA:

Request Emergency Blood

Secondary CTA:

Become a Donor

Below:

LIVE NOW

"X active requests across Lahore, Karachi & Islamabad"

Animate the number with a subtle count-up.

Add a small pulsing live indicator.

---

# 8. HERO VISUAL

On the right side desktop:

Create a floating "Live Request" interface card.

Example:

CRITICAL
O+

2 UNITS NEEDED

Jinnah Hospital
Lahore Cantonment

Ward 3

12 min ago

Awaiting Donor

[I WILL DONATE]

Behind it:

2–3 partially visible translucent cards creating depth.

Some cards should be slightly rotated or offset.

Use subtle parallax movement.

The interface should feel like an actual real-time emergency feed.

On mobile, transform this visual into a compact stacked card below the hero copy.

---

# 9. STATISTICS SECTION

Create three premium statistical cards.

Cards:

2.3M
Annual blood donation deficit

82%
Family/replacement donor dependency

100K+
Transfusion-dependent thalassemia patients

Each card should contain:

* huge number
* short explanation
* source
* subtle visual indicator
* micro animation

Use count-up animations when entering viewport.

Do NOT make them look like generic SaaS KPI cards.

Use asymmetric layouts and varying visual emphasis.

---

# 10. HOW IT WORKS

Create a visually distinctive 3-step process.

REQUEST
Verify + publish

MATCH
Nearby donors receive the request

RESOLVE
Donor En Route → Fulfilled

Use a horizontal connected path on desktop.

The connecting line should subtly animate like data traveling through the system.

Each step has:

* number
* icon
* title
* description
* status animation

On mobile convert to a vertical timeline.

---

# 11. LIVE REQUEST BOARD

This is the MOST IMPORTANT UI COMPONENT in the entire system.

Design a dedicated:

## /live-board

page.

Header:

"Live Emergency Requests"

Subheading:

"Verified requests currently seeking donors."

Show a real-time indicator:

● LIVE

Filters:

City:
Lahore
Karachi
Islamabad

Blood group:

A+
A-
B+
B-
O+
O-
AB+
AB-

Urgency:

Critical
Urgent
Routine

District selector.

Create a sophisticated filter bar using glass + subtle neumorphic controls.

---

# 12. REQUEST CARD DESIGN

Do NOT use generic dashboard cards.

Create a distinctive request card.

Structure:

Top:

CRITICAL
12 MIN AGO

Large blood group:

O+

Right:

2 UNITS

Hospital:

Jinnah Hospital

Location:

Lahore Cantonment

Ward:

Ward 3

Status:

🔴 AWAITING DONOR

Bottom:

"I Will Donate"

Add:

Verified Request ✓

The verification indicator should feel trustworthy and subtle.

Use a left-side urgency rail.

Critical requests have a subtle animated glow/pulse.

Urgent requests have a softer indicator.

Routine requests are visually calmer.

---

# 13. REQUEST CARD ANIMATION

When a new request arrives:

* card slides down from top
* opacity 0 → 1
* slight blur → sharp
* urgency indicator briefly pulses
* live counter updates

When request becomes:

Awaiting Donor → Donor En Route

animate:

* status badge
* progress indicator
* card layout
* CTA

Do NOT use flashy animations.

Animation should feel like real operational state changes.

---

# 14. REQUEST DETAIL PAGE

Create:

## /request/[requestId]

This page must feel extremely trustworthy.

Desktop layout:

LEFT:
Request information

RIGHT:
Live status panel

Information:

Blood Group
O+

Units Required
2

Hospital
Jinnah Hospital

District
Lahore Cantonment

Ward
Ward 3

Medical Context
Trauma

Urgency
Critical

Requested
12 minutes ago

Verification:

Hospital slip preview

"Request verified"

---

# 15. STATUS PANEL

Large visual status component.

State 1:

🔴
AWAITING DONOR

"Waiting for a nearby donor."

Primary CTA:

I WILL DONATE

State 2:

🟡
DONOR EN ROUTE

Show:

Donor:
Ahmed K.

ETA:
30 minutes

Commitment window:

01:12:34

Add animated countdown ring.

State 3:

🟢
FULFILLED

"Blood request successfully fulfilled."

Use a restrained celebratory animation.

No confetti.

Instead use:

soft expanding ring
checkmark animation
subtle glow

---

# 16. DONOR ACCEPTANCE FLOW

When donor presses:

"I WILL DONATE"

Open a premium confirmation modal.

Title:

"You're about to help."

Ask:

"Estimated time to reach the hospital?"

Options:

15 min
30 min
45 min
60 min
90 min

Use interactive neumorphic selection cards.

Then:

CONFIRM & GO

On confirmation:

Animate the transition into:

DONOR EN ROUTE

The CTA should transform instead of simply disappearing.

---

# 17. REQUEST CREATION FLOW

Create a beautiful 4-step onboarding experience.

Route:

/request/new

Progress:

01 PATIENT
02 VERIFY
03 DOCUMENT
04 REVIEW

Create a floating glass container with strong visual hierarchy.

STEP 1:

Patient Information

Fields:

Patient name
Hospital
Ward/floor/bed
Blood group
Units required
Medical context
Urgency

Use smart form layouts.

Blood groups should use visually distinct selectable chips.

Urgency:

CRITICAL
URGENT
ROUTINE

Critical should immediately communicate urgency without overwhelming the page.

---

# 18. OTP VERIFICATION

Create:

Phone verification

03XX XXXXXXX

6-digit OTP input.

Show:

"Verification protects genuine emergency requests."

Animated OTP entry states:

idle
typing
verified
error

Successful verification:

✓ Phone verified

Use a subtle checkmark animation.

---

# 19. HOSPITAL SLIP UPLOAD

Create an elegant drag-and-drop upload area.

Default:

Upload hospital slip

"Prescription, blood order form or admission receipt"

Support:

JPG
PNG
PDF

Max 5 MB

After upload:

Display document preview.

Show:

✓ Document attached

Allow:

Replace
Remove
Preview

Make this feel like a polished fintech document-upload experience rather than a basic HTML upload field.

---

# 20. REVIEW & PUBLISH

Create a final verification screen.

Show all request information in organized sections.

Include:

Patient
Hospital
Blood group
Units
Urgency
Ward
Phone verification
Hospital slip

Final checkbox:

"I confirm this is a genuine emergency medical request."

Primary CTA:

PUBLISH EMERGENCY REQUEST

After publishing:

Create an animated success state:

REQUEST LIVE

"Nearby donors have been notified."

Show:

Live board
WhatsApp
SMS
Push

as notification channels.

---

# 21. DONOR REGISTRATION

Route:

/donor/register

Design as an extremely low-friction onboarding experience.

Fields:

Full name
Phone
City
District
Blood group
Notification preferences
Last donation date

Blood group selection should be one of the most visually polished components.

Show a small contextual message:

"Your blood type helps us find the right emergency faster."

---

# 22. DONOR DASHBOARD

Route:

/dashboard

Create a premium personal dashboard.

Header:

"Good morning, Ahmed."

Primary status:

AVAILABLE TO HELP

Stats:

Donations fulfilled
Requests responded to
Next eligible donation date

Main section:

ACTIVE COMMITMENT

if donor has accepted a request.

Show:

Hospital
Blood group
ETA
Countdown
Status

History section:

Donation history timeline.

Use timeline cards instead of generic tables where appropriate.

---

# 23. IMPACT DASHBOARD

Route:

/impact

This should feel like a public transparency dashboard.

Hero:

"Every response closes a gap."

Metrics:

847
Requests fulfilled

34 min
Average response time

2,431
Registered donors

Add charts:

Requests by city
Blood group demand vs donor availability
Response time
Monthly fulfilled requests
Top responding districts

Use elegant data visualizations.

Do not create generic enterprise BI dashboards.

Make the data visualization feel human.

Include contextual labels such as:

"O+ is currently the most requested blood group."

---

# 24. HOW IT WORKS PAGE

Create an editorial explanatory page.

Explain:

1. Request
2. Verify
3. Match
4. Donate
5. Fulfill

Use large typography, diagrams, animated transitions and real UI examples.

Include:

"Why not WhatsApp?"

Create a visual comparison:

WhatsApp:

Unstructured
No status
No verification
No matching
No ETA

ErythroNet:

Structured
Verified
Real-time
District matching
Status lock

Do not attack WhatsApp aggressively. Keep the comparison factual.

---

# 25. MOBILE DESIGN

Mobile is NOT a scaled-down desktop.

Create dedicated mobile layouts.

Target:

390px primary mobile frame.

Also test:

320px
375px
430px

Mobile navigation:

Logo
Live status
Menu / profile

Hero:

Stack content vertically.

Live request card immediately below CTAs.

Live board:

Filters become horizontally scrollable chips.

Request cards become vertical.

Request detail:

Status panel appears first.

Primary action:

sticky bottom CTA.

For example:

[I WILL DONATE]

This button must remain accessible while scrolling.

Forms:

one-column

Large touch targets.

Minimum interactive target:

44px.

---

# 26. TABLET

Create responsive tablet layout around:

768px – 1024px.

Use:

2-column cards
condensed navigation
adaptive dashboard grids

Avoid awkward desktop layouts squeezed into tablet width.

---

# 27. DESKTOP

Primary desktop frame:

1440 × 1024

Also account for:

1280px
1536px

Use max-width content containers.

Avoid extremely wide text lines.

Suggested content width:

1200–1280px.

---

# 28. RESPONSIVE BEHAVIOR

Define responsive behavior for every major component.

Desktop → Tablet → Mobile.

Components should transform intelligently rather than simply shrink.

Examples:

Desktop navigation → mobile menu

Desktop filter bar → horizontal scrolling filter chips

Horizontal process → vertical timeline

Multi-column stats → stacked cards

Two-column request detail → single-column

Dashboard grid → vertical sections

Desktop modal → bottom sheet on mobile where appropriate

---

# 29. DESIGN SYSTEM

Create a dedicated Figma Design System page.

Include:

Colors
Typography
Spacing
Grid
Radius
Shadows
Glass surfaces
Neumorphic surfaces
Buttons
Inputs
Selects
Checkboxes
Radio buttons
Chips
Badges
Cards
Status indicators
Progress indicators
Modals
Bottom sheets
Tooltips
Toasts
Navigation
Tabs
Charts
Empty states
Loading states
Error states

Use reusable components with variants.

Use variables for:

colors
spacing
radius
typography
shadows
glass levels
status states

---

# 30. GLASSMORPHISM TOKENS

Create consistent glass surfaces.

Glass levels:

Glass / 05
Glass / 10
Glass / 15
Glass / 20

Use:

background transparency
backdrop blur
subtle border
soft inner highlight

Do not use glass surfaces behind every component.

Reserve stronger glass treatment for:

navigation
hero cards
floating panels
important status modules
modals

---

# 31. NEUMORPHISM TOKENS

Create:

Raised
Pressed
Inset

states.

Use them for:

buttons
toggles
filters
blood group selectors
compact controls

Keep shadows subtle.

The neumorphism should complement the glassmorphism rather than compete with it.

---

# 32. BORDER RADIUS

Avoid excessive rounded "AI UI" aesthetics.

Use a structured radius system:

Small:
8px

Medium:
12px

Large:
18px

Hero / major surfaces:
24px

Use larger radius selectively.

Avoid making every element pill-shaped.

---

# 33. ICONOGRAPHY

Use Lucide-style icons.

Icons must be:

minimal
consistent
2px stroke
rounded

Suggested icons:

Droplet
HeartPulse
MapPin
Clock
ShieldCheck
Bell
MessageSquare
Hospital
Users
Activity
CheckCircle
AlertTriangle
Upload
Phone
Navigation
ArrowRight

Do not use random emoji as primary UI icons.

---

# 34. ANIMATION SYSTEM

Design animation behavior for implementation with Framer Motion / Motion.

Animation principles:

FAST
PURPOSEFUL
SUBTLE
RESPONSIVE

Page entrance:

opacity + translateY

Duration:
400–700ms

Stagger:

60–120ms

Cards:

scale 0.98 → 1

Status transitions:

300–500ms

Buttons:

150–250ms

Hover:

subtle elevation
border glow
translateY(-1px)

Live request:

slide + fade

Count-up:

800–1200ms

---

# 35. MICRO-INTERACTIONS

Design these states explicitly:

Button hover
Button pressed
Button loading
Button success
Input focus
Input error
OTP success
Upload progress
Upload complete
Request published
Request accepted
Request cancelled
Request fulfilled
Countdown warning
Countdown expired
New live request
Notification received
Filter selected
Filter cleared

---

# 36. EMERGENCY ANIMATION RULE

Critical requests can have a very subtle pulse.

Do NOT create:

flashing screens
rapid blinking
aggressive red animations
constant moving backgrounds

Emergency ≠ chaos.

The product should communicate:

"Something important is happening, and the system is in control."

---

# 37. LOADING STATES

Create skeleton loaders for:

Live board
Request detail
Impact dashboard
Donor dashboard

Use animated shimmer, but keep it subtle.

Create empty states:

"No active requests in this area."

"No current donor commitments."

"No fulfilled requests yet."

---

# 38. ERROR STATES

Design:

OTP failed
Invalid phone
Upload failed
Network disconnected
Request expired
Request already fulfilled
Donor acceptance unavailable
Session expired

Each error must explain:

WHAT HAPPENED
WHAT TO DO NEXT

Avoid technical error messages.

---

# 39. OFFLINE / CONNECTION STATE

Because this is a real-time emergency platform, design a connection indicator.

Example:

● LIVE

When disconnected:

○ RECONNECTING...

When restored:

● LIVE

Animate the transition.

---

# 40. TRUST & SAFETY

Trust is a major product requirement.

Create visual indicators:

Verified request
Phone verified
Hospital slip attached
Donor verified

Do not claim medical verification.

The design should communicate:

"Document attached for community accountability."

Avoid language suggesting ErythroNet medically validates the request.

---

# 41. DATA PRIVACY

Do not visually expose:

full phone numbers
private patient information unnecessarily
exact sensitive information

Use:

Ahmed K.
03XX •••• 921
etc.

---

# 42. ACCESSIBILITY

The interface must remain accessible despite visual effects.

Ensure:

WCAG-aware contrast.

Do not rely only on:

red vs green

for status.

Every status must include:

color + icon + text.

Examples:

🔴 Awaiting Donor
🟡 Donor En Route
🟢 Fulfilled

Respect:

prefers-reduced-motion.

Animations should reduce or disable when requested.

---

# 43. NO VIBECODED / GENERIC AI DESIGN

This is extremely important.

DO NOT produce:

* generic purple gradients
* random neon colors
* excessive rounded cards
* every section floating inside a card
* huge meaningless typography
* random blobs
* generic SaaS dashboard
* generic hospital website
* excessive glass panels
* excessive glowing borders
* fake 3D objects
* meaningless charts
* stock AI illustrations
* random decorative icons
* excessive pills
* "AI startup" visual clichés

Do not make it look like:

"generated by an AI website builder."

Instead make it feel:

INTENTIONAL
EDITORIAL
OPERATIONAL
HUMAN
PREMIUM
TRUSTWORTHY

---

# 44. VISUAL UNIQUENESS

Create a recognizable visual signature.

Use a combination of:

deep crimson atmospheric backgrounds
frosted glass panels
subtle neumorphic controls
editorial typography
real-time status visualization
thin technical lines
data-driven visual hierarchy
asymmetric composition
soft depth
humanitarian visual tone

The product should be recognizable even without the logo.

---

# 45. FIGMA FILE STRUCTURE

Organize the Figma file into pages:

01 — Cover
02 — Design Principles
03 — Brand & Logo
04 — Colors
05 — Typography
06 — Components
07 — Motion & Interaction
08 — Landing Page
09 — Live Board
10 — Request Flow
11 — Request Detail
12 — Donor Registration
13 — Donor Dashboard
14 — Impact Dashboard
15 — How It Works
16 — Responsive Mobile
17 — Responsive Tablet
18 — States & Edge Cases

Use Auto Layout extensively.

Use components and variants.

Use variables for:

colors
spacing
radius
typography
shadows
glass levels
status states

Name components systematically.

Example:

Button / Primary
Button / Secondary
Button / Destructive

Status / Awaiting
Status / En Route
Status / Fulfilled

RequestCard / Critical
RequestCard / Urgent
RequestCard / Routine

Input / Default
Input / Focus
Input / Error
Input / Success

---

# 46. FINAL QUALITY BAR

Before completing the design, review every screen against these questions:

Does this look like a real product?

Does the emergency information appear immediately?

Can a donor understand a request in under 5 seconds?

Can a donor accept a request with minimal friction?

Can a patient understand whether a donor has accepted?

Does the design clearly distinguish:

Awaiting Donor
Donor En Route
Fulfilled

Does the design work on a low-width mobile screen?

Does it still look premium without animations?

Does it still work if glass effects are disabled?

Does the design avoid generic AI-generated aesthetics?

Does every visual element have a functional reason?

Does the product communicate trust?

Does the interface feel fast and calm during an emergency?

---

# FINAL DESIGN DIRECTION

The final result should feel like:

**"A modern emergency coordination network built specifically for Pakistan."**

Not:

"A blood donation landing page."

Not:

"A hospital management system."

Not:

"A generic SaaS dashboard."

The emotional reaction should be:

**"If someone I care about needed blood right now, I would trust this interface."**

Create the complete responsive high-fidelity Figma design with reusable components, realistic content, interaction states, animation specifications, and desktop/tablet/mobile variants.
