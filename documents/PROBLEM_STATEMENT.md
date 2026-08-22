# GlobeTrotter — Empowering Personalized Travel Planning

## Overall Vision

GlobeTrotter aims to become a personalized, intelligent, and collaborative platform that transforms how people plan and experience travel. Users should be able to dream, design, and organize trips with ease through an end-to-end planning tool that combines flexibility and interactivity.

The platform envisions a world where travelers can explore global destinations, visualize journeys through structured itineraries, make cost-effective decisions, and share plans within a community—making travel planning as exciting as the trip itself.

## Mission

Build a user-centric, responsive application that simplifies multi-city travel planning. Travelers should have intuitive tools to:

- Add and manage travel stops and durations
- Explore cities and activities of interest
- Estimate trip budgets automatically
- Visualize timelines and plans
- Share trip plans with others

The solution must be functional and insightful, powered by a well-designed relational database and a smooth frontend. Focus on helping users organize personalized trips efficiently, stay within budget, and keep full visibility of their journey.

## Problem Statement

Design and develop a complete travel planning application where users can:

- Create customized multi-city itineraries
- Assign travel dates, activities, and budgets
- Discover activities and destinations through search
- Receive cost breakdowns and visual calendars
- Share their plans publicly or with friends

The application must demonstrate proper use of **relational databases** to store and retrieve complex travel data (user-specific itineraries, stops, activities, estimated expenses). The UI should adapt dynamically to each user's trip flow.

**Mockup:** [Excalidraw](https://link.excalidraw.com/l/65VNwvy7c4X/6CzbTgEeSr1)

---

## Required Screens & Features

### 1. Login / Signup Screen

| | |
|---|---|
| **Description** | Entry point of the app allowing users to create or access their account |
| **Purpose** | Authenticate users to manage personal travel plans |
| **Key components** | Email & password fields, Login button, Signup link, Forgot Password, basic validation |

### 2. Dashboard / Home Screen

| | |
|---|---|
| **Description** | Central hub showing upcoming trips, popular cities, and quick actions |
| **Purpose** | Navigate to trips and explore inspiration |
| **Key components** | Welcome message, list of recent trips, “Plan New Trip” button, recommended destinations, budget highlights |

### 3. Create Trip Screen

| | |
|---|---|
| **Description** | Form to initiate a new trip by name, travel dates, and description |
| **Purpose** | Begin creating a personalized travel plan |
| **Key components** | Trip name, start & end dates, trip description, optional cover photo upload, save button |

### 4. My Trips (Trip List) Screen

| | |
|---|---|
| **Description** | List view of all trips created by the user with basic summary data |
| **Purpose** | Easily access and manage existing or upcoming trips |
| **Key components** | Trip cards (name, date range, destination count), edit / view / delete actions |

### 5. Itinerary Builder Screen

| | |
|---|---|
| **Description** | Interface to add cities, dates, and activities for each stop |
| **Purpose** | Construct the full day-wise trip plan interactively |
| **Key components** | “Add Stop” button, select city and travel dates, assign activities per stop, reorder cities |

### 6. Itinerary View Screen

| | |
|---|---|
| **Description** | Visual representation of the completed trip itinerary |
| **Purpose** | Review the full plan (timeline or grouped by cities) |
| **Key components** | Day-wise layout, city headers, activity blocks with time and cost, view mode toggle (calendar / list) |

### 7. City Search

| | |
|---|---|
| **Description** | Search interface to find and add cities, with country, cost index, and popularity |
| **Purpose** | Discover and include relevant cities in the itinerary |
| **Key components** | Search bar, city list with meta info, “Add to Trip” button, filter by country / region |

### 8. Activity Search

| | |
|---|---|
| **Description** | Browse and select things to do at each stop, by interest or cost |
| **Purpose** | Enrich trips with sightseeing, food tours, adventure activities, etc. |
| **Key components** | Activity filters (type, cost, duration), add / remove buttons, quick view of description and images |

### 9. Trip Budget & Cost Breakdown Screen

| | |
|---|---|
| **Description** | Summarized financial view with estimated total cost and breakdowns |
| **Purpose** | Help travelers stay informed and within budget |
| **Key components** | Breakdown by transport, stay, activities, meals; pie / bar charts; average cost per day; overbudget-day alerts |

### 10. Trip Calendar / Timeline Screen

| | |
|---|---|
| **Description** | Calendar-based or vertical timeline of the full itinerary |
| **Purpose** | Visualize the journey and daily plan flow |
| **Key components** | Calendar component, expandable day views, drag-to-reorder activities, quick editing |

### 11. Shared / Public Itinerary View Screen

| | |
|---|---|
| **Description** | Public page with a shareable version of an itinerary |
| **Purpose** | Let others view, get inspired, or copy the trip |
| **Key components** | Public URL, itinerary summary, “Copy Trip” button, social sharing, read-only view |

### 12. User Profile / Settings Screen

| | |
|---|---|
| **Description** | Settings page to update profile and preferences |
| **Purpose** | Control user data, preferences, and privacy |
| **Key components** | Editable name, photo, email; language preference; delete account; saved destinations list |

### 13. Admin / Analytics Dashboard *(Optional)*

| | |
|---|---|
| **Description** | Admin-only interface for user trends, trip data, and platform usage |
| **Purpose** | Monitor adoption, popular cities, and user behavior |
| **Key components** | Tables and charts (trips created, top cities / activities, engagement), user management tools |

---

## Hackathon Rules

### Must Have

1. **Real-time / dynamic data** — Use live or dynamic data sources. Avoid relying on static JSON except during initial prototyping.
2. **Responsive UI** — Clean, responsive interface with a consistent color scheme and layout.
3. **Input validation** — Robust validation for all user inputs.
4. **Intuitive navigation** — Clear menus, proper spacing, and placement.
5. **Proper version control** — Use Git correctly; one person managing the repo alone is not enough.

### Nice to Have

1. **Backend & database** — Design backend APIs, model data, and set up a local database.
2. **Understand before you paste** — Fully understand AI or code snippets before using them; adapt them to the project—do not blindly copy-paste.
3. **Offline / local capability** — Plan for offline or local solutions; do not depend entirely on internet or cloud tools.
4. **Purposeful tech stack** — Use trendy technologies only when they add real value.
