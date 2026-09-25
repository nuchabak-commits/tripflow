# TripFlow — Project Base

> Central project context for development, planning, and future iterations.

**Project:** TripFlow  
**Type:** Travel Planning Web Application  
**Frontend:** React + TypeScript + Vite  
**Current Version:** v0.4 Map  
**Status:** Active Development

---

# 1. Project Vision

TripFlow is a visual and interactive travel planning application designed to keep an entire trip in one place.

The application should allow users to plan:

- Trips
- Daily itineraries
- Places
- Transportation
- Expenses
- Budgets
- Packing
- Notes
- Travel documents
- Reservations

The long-term goal is to make TripFlow feel like a combination of:

```text
Travel Planner
     +
Itinerary Builder
     +
Trip Expense Tracker
     +
Packing Assistant
     +
Travel Dashboard
```

The application should prioritize:

1. Beautiful UI
2. Fast interaction
3. Visual trip planning
4. Minimal data entry
5. Useful travel information
6. Mobile usability
7. Offline-friendly features

---

# 2. Core Concept

A user creates a:

```text
Trip
```

Each Trip becomes the central container for:

```text
Trip
│
├── Overview
├── Itinerary
│   ├── Day 1
│   ├── Day 2
│   ├── Day 3
│   └── ...
│
├── Places
├── Map
├── Budget
├── Expenses
├── Packing
├── Notes
├── Reservations
└── Documents
```

All modules should reference the same Trip.

Example:

```text
Chengdu
26–29 December 2026

Trip ID
   │
   ├── 4 Days
   ├── 12 Places
   ├── ฿30,000 Budget
   ├── 18 Expenses
   ├── 24 Packing Items
   └── Notes
```

---

# 3. Current Technology

## Frontend

```text
React
TypeScript
Vite
```

## UI / Interaction

```text
Lucide React
Motion
dnd-kit
Recharts
```

## Date

```text
date-fns
```

## Current Storage

```text
Browser
   ↓
LocalStorage
```

Current architecture:

```text
React UI
   ↓
Application State
   ↓
LocalStorage
```

No backend is required for the current version.

---

# 4. Current Version

## v0.2 — Functional

The application has moved beyond a static UI prototype.

Current core flows should be functional.

---

# 5. Current Features

## 5.1 Dashboard

Dashboard displays:

- Greeting
- Search
- Featured / next trip
- Upcoming trips
- My Trips
- Trip filters
- Create Trip

Trip filters:

```text
All
Upcoming
Past
Favorites
```

---

# 6. Trip Management

Users can:

```text
Create Trip
Open Trip
Favorite Trip
Delete Trip
```

Trip information includes:

```text
Destination
Country
Start Date
End Date
Budget
Favorite
```

Future fields:

```text
Cover Image
Currency
Timezone
Travelers
Trip Type
Home Airport
Destination Airport
```

---

# 7. Itinerary

Each Trip contains multiple travel days.

Example:

```text
Day 1 — 26 Dec

09:20  Arrive Chengdu
11:00  Hotel Check-in
13:30  Taikoo Li
17:00  IFS Panda
19:00  Hotpot Dinner
```

Current capabilities:

```text
Add Place
Edit Place
Delete Place
Drag & Drop
Reorder
```

Each itinerary item can contain:

```text
Time
Title
Description
Duration
```

Future fields:

```text
Location
Latitude
Longitude
Category
Cost
Reservation
Images
Transportation
Opening Hours
Website
Phone
```

---

# 8. Budget

Each Trip has its own budget.

Example:

```text
Budget
฿30,000

Spent
฿23,480

Remaining
฿6,520
```

Expenses can be:

```text
Add
Edit
Delete
```

Expense fields:

```text
Description
Amount
Category
```

Suggested categories:

```text
Hotel
Transport
Food
Shopping
Activity
Flight
Other
```

Future Budget features:

```text
Budget by Category
Daily Spending
Currency Conversion
Expense Charts
Split Expenses
Multi-currency
Payment Method
```

---

# 9. Packing

Each Trip contains its own packing list.

Example categories:

```text
Clothes
Electronics
Travel Essentials
Documents
Toiletries
Medicine
Other
```

Users can:

```text
Add Item
Check Item
Uncheck Item
Delete Item
```

Packing progress:

```text
22 / 32

68% Packed
```

The percentage updates dynamically.

Future features:

```text
Reusable Packing Templates
Weather-based Suggestions
Destination Suggestions
Auto Packing List
Weight Estimation
Luggage Assignment
```

---

# 10. Notes

Each Trip contains personal notes.

Examples:

```text
Hotel address

Airport instructions

Restaurant list

Emergency contact

Things to buy
```

Notes are persisted with the Trip.

Future improvement:

```text
Multiple Notes
Rich Text
Checklist Notes
Pinned Notes
```

---

# 11. Local Persistence

Current data is stored using:

```text
LocalStorage
```

Therefore:

```text
Create Trip
    ↓
Save
    ↓
Refresh Browser
    ↓
Trip remains available
```

LocalStorage is appropriate for early versions because:

- No account required
- No backend required
- Fast development
- Easy deployment
- Works as portfolio demo

---

# 12. Planned Storage Evolution

Long-term architecture:

```text
v0.x

React
 ↓
LocalStorage
```

Later:

```text
React
 ↓
REST API
 ↓
Database
```

Possible backend:

```text
ASP.NET Core Web API
```

or

```text
Node.js API
```

Possible database:

```text
PostgreSQL
```

Potential production architecture:

```text
React / TypeScript
        │
        ▼
     REST API
        │
        ▼
    PostgreSQL
        │
        ├── Users
        ├── Trips
        ├── TripDays
        ├── Places
        ├── Expenses
        ├── PackingItems
        └── Reservations
```

---

# 13. Main Navigation

Current / planned application navigation:

```text
Home

My Trips

Calendar

Packing List

Budget

Places

Settings
```

Trip navigation:

```text
Overview

Itinerary

Map

Budget

Packing

Notes
```

Future:

```text
Bookings

Documents
```

---

# 14. Calendar

Calendar should provide a global view of trips.

Example:

```text
December 2026

SUN MON TUE WED THU FRI SAT

20  21  22  23  24  25  26
                         ● Chengdu

27  28  29
●   ●   ●
```

Possible features:

- Trip dates
- Activities
- Flights
- Hotel bookings
- Reservations
- Calendar navigation
- Trip color coding

---

# 15. Places

Places should become a reusable travel collection.

Example:

```text
Saved Places

Chengdu
├── Taikoo Li
├── IFS Panda
├── People's Park
└── Kuanzhai Alley
```

Place data:

```text
Name
Category
Address
Latitude
Longitude
Website
Opening Hours
Notes
Images
```

Places should be reusable inside itinerary items.

---

# 16. Map

Planned interactive map:

```text
Day 1

Airport
   ↓
Hotel
   ↓
Taikoo Li
   ↓
IFS Panda
   ↓
Hotpot
```

Potential technology:

```text
Leaflet
+
OpenStreetMap
```

Possible functionality:

- Place markers
- Marker categories
- Daily route
- Fit map to itinerary
- Click marker → Place detail
- Day filter
- All-trip view

---

# 17. Transportation

Future itinerary items should support transportation.

Example:

```text
Taikoo Li
   │
   │ Metro
   │ 18 min
   │ ¥3
   ▼
IFS Panda
```

Transport types:

```text
Walk
Car
Taxi
Grab
Metro
Train
Bus
Flight
Boat
Other
```

---

# 18. Reservations

Future module:

```text
Reservations

✈ Flight
🏨 Hotel
🍽 Restaurant
🎟 Attraction
🚆 Train
```

Reservation information:

```text
Provider
Booking Number
Date
Time
Price
Status
Notes
```

Reservation can be linked to itinerary.

---

# 19. Travel Documents

Possible future document vault:

```text
Documents

Passport Copy
Travel Insurance
Flight Booking
Hotel Voucher
Train Ticket
Attraction Ticket
```

For privacy, document storage should be designed carefully before implementation.

Do not store sensitive documents insecurely in LocalStorage.

---

# 20. Multi-Currency

Travel often involves multiple currencies.

Example:

```text
Trip Currency

THB
CNY
JPY
LAK
USD
```

Expense example:

```text
Hotpot

¥220

≈ ฿1,040
```

Future structure:

```text
Original Amount
Original Currency
Exchange Rate
Converted Amount
Base Currency
```

---

# 21. Group Travel

Future TripFlow could support group travel.

Example:

```text
Travelers

Nuchaba
Friend A
Friend B
Friend C
```

Expenses could support:

```text
Paid by
Split between
Split equally
Custom split
```

Example:

```text
Hotel
฿6,000

Paid by Nuchaba

Split:
Nuchaba   ฿2,000
Friend A  ฿2,000
Friend B  ฿2,000
```

---

# 22. Weather

Future trip overview could show weather.

Example:

```text
Chengdu

26 Dec    6–12°C
27 Dec    5–11°C
28 Dec    4–10°C
29 Dec    6–13°C
```

Weather can later influence:

```text
Packing suggestions
Daily itinerary
Clothing suggestions
```

Weather should come from an external API rather than hardcoded data.

---

# 23. Search

Global search should eventually search across:

```text
Trips
Places
Itinerary
Notes
Expenses
```

Example:

```text
Search: panda

Results

Chengdu
→ IFS Panda

Notes
→ Panda Base ticket
```

---

# 24. UI Direction

TripFlow should maintain a:

```text
Clean
Modern
Friendly
Travel-focused
Visual
Interactive
```

design.

Avoid making the application look like:

```text
Enterprise Admin Dashboard
```

Prefer:

- Large destination imagery
- Cards
- Soft shadows
- Rounded components
- Clear typography
- Visual timelines
- Maps
- Progress indicators
- Smooth transitions
- Micro-interactions

---

# 25. Responsive Design

TripFlow should support:

```text
Desktop
Tablet
Mobile
```

Desktop:

```text
Sidebar
+
Main Workspace
```

Mobile:

```text
Top Header

Content

Bottom Navigation
```

Important screens to optimize for mobile:

```text
Itinerary
Map
Packing
Budget
```

These are likely to be used while traveling.

---

# 26. Dynamic Interaction Principles

If an element looks clickable, it should work.

Avoid placeholder buttons.

Example:

Bad:

```text
[ Add Expense ]

click → nothing
```

Good:

```text
Add Expense
    ↓
Form / Modal
    ↓
Save
    ↓
Budget recalculates
    ↓
Chart updates
    ↓
LocalStorage updates
```

Every major action should provide feedback.

Examples:

```text
Toast
Animation
Progress update
State change
Modal close
```

---

# 27. Data Model — Draft

## Trip

```ts
interface Trip {
  id: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  budget: number;
  favorite: boolean;

  days: TripDay[];
  expenses: Expense[];
  packing: PackingItem[];

  notes: string;
}
```

## Trip Day

```ts
interface TripDay {
  id: string;
  date: string;
  items: ItineraryItem[];
}
```

## Itinerary Item

```ts
interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  duration?: string;
}
```

## Expense

```ts
interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
}
```

## Packing Item

```ts
interface PackingItem {
  id: string;
  name: string;
  category: string;
  packed: boolean;
}
```

---

# 28. Future Data Model

Possible future entities:

```text
User

Trip

Traveler

TripDay

ItineraryItem

Place

Expense

ExpenseSplit

PackingItem

PackingTemplate

Reservation

Transport

Document

Note

Currency

ExchangeRate
```

---

# 29. Development Roadmap

## v0.1 — UI Prototype

Goal:

```text
Establish TripFlow visual identity
```

Included:

- Dashboard
- Trip cards
- Sidebar
- Initial trip screen
- Initial visual design

Status:

```text
Completed
```

---

## v0.2 — Functional

Goal:

```text
Make core interactions usable
```

Included:

- Create Trip
- Open Trip
- Delete Trip
- Favorite
- Search
- Filters
- Itinerary CRUD
- Drag & Drop
- Budget CRUD
- Packing
- Notes
- LocalStorage

Status:

```text
Current
```

---

## v0.3 — Trip Experience

Focus:

```text
Improve actual trip planning
```

Planned:

- Better Overview
- Place detail
- Categories
- Cover images
- Better date handling
- Daily itinerary improvements
- Toast notifications
- Confirmation dialogs
- Empty states
- Form validation

---

## v0.4 — Map

Planned:

- Leaflet
- OpenStreetMap
- Place coordinates
- Markers
- Day filter
- Itinerary map

---

## v0.5 — Budget+

Planned:

- Budget categories
- Charts
- Daily spending
- Multi-currency
- Better expense filters

---

## v0.6 — Packing+

Planned:

- Categories
- Templates
- Progress by category
- Duplicate template
- Travel essentials

---

## v0.7 — Reservations

Planned:

- Flight
- Hotel
- Train
- Attraction
- Restaurant

---

## v0.8 — Import / Export

Possible formats:

```text
JSON
PDF
Printable itinerary
```

Potential use:

```text
Backup Trip
Restore Trip
Share itinerary
Print itinerary
```

---

## v0.9 — Backend Preparation

Refactor application state so storage can switch from:

```text
LocalStorage
```

to:

```text
API
```

without rewriting the UI.

---

## v1.0 — Portfolio Release

Target:

- Stable core flow
- Responsive
- Mobile-friendly
- Polished animations
- Map
- Budget
- Packing
- Itinerary
- Persistent data
- README
- Screenshots
- Live deployment

---

# 30. Possible v2 Direction

After the portfolio release:

```text
Authentication
        ↓
Cloud Trips
        ↓
Share Trip
        ↓
Collaborative Planning
        ↓
Group Expenses
        ↓
Real-time Sync
```

Possible features:

```text
Login
User accounts
Cloud database
Trip sharing
Invite travelers
Permissions
Collaborative editing
```

---

# 31. Portfolio Value

TripFlow should demonstrate more than visual design.

The finished project can demonstrate:

### Frontend

```text
React
TypeScript
Responsive UI
Component Architecture
State Management
Forms
Validation
```

### Advanced UI

```text
Drag & Drop
Charts
Maps
Animation
Dynamic Forms
Progress UI
Modals
```

### Application Design

```text
Data Modeling
Local Persistence
Reusable Components
Feature Architecture
```

### Future Full Stack

```text
REST API
Authentication
Database
Cloud Deployment
```

---

# 32. Project Rules

When adding features:

### Rule 1

Do not add fake buttons.

If a control is visible and appears interactive, implement its behavior.

### Rule 2

Keep Trip as the central entity.

Features should normally belong to a Trip.

### Rule 3

Do not introduce a backend unless the feature actually requires it.

### Rule 4

Maintain LocalStorage compatibility during the early versions.

### Rule 5

Prioritize mobile usability for features used during travel.

### Rule 6

Do not sacrifice UI quality just to add more features.

### Rule 7

Avoid turning TripFlow into a generic admin dashboard.

---

# 33. Priority Backlog

## High Priority

```text
[ ] Improve Trip Overview
[ ] Edit Trip
[ ] Better Add/Edit Place form
[ ] Place categories
[ ] Toast notifications
[ ] Confirmation modal
[ ] Form validation
[ ] Cover image
[ ] Mobile navigation
```

## Medium Priority

```text
[ ] Map
[ ] Calendar improvements
[ ] Expense charts
[ ] Packing categories
[ ] Packing templates
[ ] Multi-currency
[ ] Import / Export
```

## Future

```text
[ ] Authentication
[ ] Backend API
[ ] Database
[ ] Trip sharing
[ ] Group travel
[ ] Expense splitting
[ ] Reservations
[ ] Weather
[ ] Documents
[ ] Collaborative planning
```

---

# 34. Current Product Principle

TripFlow should answer one question:

> Can I open one Trip and find everything I need to plan and manage that journey?

The application should progressively move toward:

```text
Plan
  ↓
Organize
  ↓
Budget
  ↓
Pack
  ↓
Travel
  ↓
Review
```

without requiring multiple disconnected travel tools.

---

# 35. Next Recommended Milestone

## TripFlow v0.3 — Trip Experience

Before adding APIs or backend infrastructure, improve the current core experience.

Target flow:

```text
Create Trip
    ↓
Add Cover
    ↓
Open Trip
    ↓
Overview
    ↓
Add Places
    ↓
Build Daily Itinerary
    ↓
Drag & Reorder
    ↓
Track Budget
    ↓
Prepare Packing
    ↓
Refresh
    ↓
Everything persists
```

Once this flow feels complete, proceed to Map integration.
---

# v0.3 Delivery Update — 25 September 2026

The sections above retain the original v0.2 project baseline and long-term roadmap.
This release implements v0.3 Trip Experience. README.md and CHANGELOG.md describe the delivered behavior.

Current source version: **0.3.0**.
Storage: **tripflow-v03**, migrated from **tripflow-v02** without overwriting it.
Trip.coverUrl is optional; Stop.day=0 is the Unscheduled holding area.
No backend or live maps were introduced. Calendar remains an agenda view.
Next milestone: **v0.4 — Map**, with coordinates and real map markers/routes.

---

# v0.4 Delivery Update — 25 September 2026

This release implements **v0.4 — Map** (Leaflet + OpenStreetMap).

Current source version: **0.4.0**.
Storage: **tripflow-v04**, migrated from **tripflow-v03** (or tripflow-v02) without overwriting it; backup key tripflow-v03-backup.
Stop.lat / Stop.lng are optional WGS84 coordinates, present together or not at all.

Delivered:

- Trip tab **Map**: numbered per-day pins, per-day colors, dashed straight-line daily route, distance totals.
- Filters: Whole trip / Day N / Unscheduled; list and marker selection in sync; popup with Edit and Directions.
- Activity form location: Nominatim search (explicit button), tap/drag pin, paste coordinates or map links.
- Itinerary day map preview, Pinned badge, Open full map.
- Offline tile notice; configurable tile provider via VITE_MAP_TILE_URL.

Not yet: marker clustering, road routing / travel times, offline tiles, reusable Places library.
Next milestone: **v0.5 — Budget+**.
