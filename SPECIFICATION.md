# Debate Timer — Specification

A browser-based debate countdown timer for managing timed speaking turns across two teams. Participants are split into **Team A** and **Team B**, their speaking order is interleaved, and each speaker receives an equal, configurable amount of time. The entire application runs as a static website — no server, no frameworks, no build step.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Pre-configuring Participants](#pre-configuring-participants)
3. [Setup Screen](#setup-screen)
4. [Countdown Screen](#countdown-screen)
5. [Debate Over Screen](#debate-over-screen)
6. [Reload Protection](#reload-protection)
7. [Technical Details](#technical-details)
8. [Project Files](#project-files)

---

## Getting Started

### Option A — Local HTTP server (recommended)

```bash
make run
```

This starts a Python HTTP server on **port 8080**. Open `http://localhost:8080` in your browser.

### Option B — Open directly

Open `index.html` in any modern browser. No server is required; all assets are loaded locally.

---

## Pre-configuring Participants

The file `app.js` contains an `INITIAL_PARTICIPANTS` array near the top of the file:

```js
var INITIAL_PARTICIPANTS = [
  "María García",
  "James Chen",
  // …add or remove names here…
];
```

- On page load every non-empty entry is added to the participant list automatically.
- Set the array to `[]` to start with a blank list.
- Changes to this array require editing `app.js` and refreshing the page.

---

## Setup Screen

The setup screen is the landing page and contains three sections: **Participants**, **Speaking Time**, and the **Start Debate** button.

### Participants

| Action | How |
|--------|-----|
| **Add** | Type a name in the text field and press **Enter** or click **Add**. |
| **Remove** | Click the **✕** button next to a participant. |
| **Edit** | Click the **✏️** button to enter inline edit mode. Press **Enter** or click **✓** to save; press **Escape** or click away to cancel. |
| **Reorder** | Click the **▲** / **▼** buttons to move a participant up or down in the list. |

Participants are displayed in a numbered ordered list. Any change to the participant list **clears the current team assignments**, requiring a new randomization before the debate can start.

### Team Randomization

- The **Randomize Teams** button is enabled when there are **2 or more** participants.
- Clicking it shuffles all participants and splits them into **Team A** (first half, rounded up) and **Team B** (remaining).
- A **team preview** appears showing both teams side by side.
- The speaking order is **interleaved**: Team A speaker 1, Team B speaker 1, Team A speaker 2, Team B speaker 2, and so on.
- Clicking **Randomize Teams** again produces a new random assignment.

### Download / Upload Team Assignments

- **Download Teams** — Visible after teams are randomized. Downloads a `debate-teams.txt` file containing:
  ```
  Team A: Name1, Name2, …
  Team B: Name3, Name4, …
  Speaking Order: Name1 (A), Name3 (B), Name2 (A), …
  ```
- **Upload Teams** — Always visible. Accepts a `.txt` file in the same format. On upload:
  - The participant list is rebuilt from both teams.
  - Team assignments and speaking order are restored.
  - If the file contains no `Speaking Order` line, an interleaved order is generated from the team lists.

### Speaking Time

Two numeric inputs set the countdown duration:

| Field | Range | Default |
|-------|-------|---------|
| Minutes | 0 – 99 | 5 |
| Seconds | 0 – 59 | 0 |

Values are clamped to their valid range when the field loses focus.

### Start Debate

The **Start Debate** button is enabled only when **all three** conditions are met:

1. At least one participant exists.
2. The total speaking time is greater than zero.
3. Teams have been randomized (team assignments are not `null`).

Clicking it transitions to the Countdown Screen.

---

## Countdown Screen

The countdown screen is a full-viewport overlay that displays one speaker at a time.

### Display Elements

| Element | Description |
|---------|-------------|
| **Team label** | The current speaker's team (e.g. "Team A"), shown in uppercase above the name. |
| **Speaker name** | Large, prominent text showing who is speaking. |
| **Timer** | Countdown in `MM:SS` format, displayed in very large text. |
| **Progress indicator** | "Speaker N of M" text. |
| **Next up** | Shows the next speaker's name and team, or "Last speaker" if this is the final turn. |

### Timer Behavior

- Each speaker receives the same amount of time configured on the setup screen.
- The timer counts down by one second at a time.
- **Red warning**: When the remaining time is **≤ 10%** of the total time (rounded up), the entire screen background turns red.
- At **00:00** the timer stops and the **Next Speaker** button appears (or **Finish** for the last speaker).

### Controls

| Button | Visible | Behavior |
|--------|---------|----------|
| **Pause** | While timer is running | Stops the countdown. Button text changes to **Resume**. |
| **Resume** | While paused | Resumes the countdown. Button text changes back to **Pause**. |
| **Skip** | While timer is running or paused | Immediately advances to the next speaker (or to the end screen if this was the last speaker). |
| **Next Speaker** / **Finish** | When timer reaches 00:00 | Advances to the next speaker, or shows the Debate Over screen after the last speaker. |
| **↩ Restart** | Always (small, bottom of screen) | Returns to the Setup Screen with all data intact (participants, teams, time settings). |

---

## Debate Over Screen

Displayed after the last speaker's time ends (via **Finish** or **Skip**).

- Shows the heading **"Debate Over"** and the subtitle **"All participants have spoken."**
- A **Restart** button returns to the Setup Screen with all previous data (participants, teams, time) preserved.

---

## Reload Protection

A `beforeunload` warning is triggered whenever:

- There is at least one participant in the list, **or**
- A debate is currently in progress.

This prevents accidental loss of participant data or an active debate session.

---

## Technical Details

| Aspect | Detail |
|--------|--------|
| **Architecture** | Pure static website — HTML + CSS + vanilla JavaScript. |
| **Frameworks** | None. No libraries or build tools required. |
| **Responsive design** | Fluid layout using `clamp()` for font sizes; a `@media` breakpoint at 500 px adjusts padding and stacks time inputs vertically. |
| **Browser support** | Any modern browser supporting ES5, `clamp()`, and `Blob` / `FileReader` APIs. |
| **Accessibility** | ARIA labels on interactive elements; semantic HTML structure. |

---

## Project Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure — setup screen, countdown screen, and end screen. |
| `style.css` | All styling — dark theme, responsive layout, screen transitions, warning state. |
| `app.js` | Application logic — participant management, team randomization, countdown timer, file I/O. |
| `Makefile` | Convenience target: `make run` starts a local Python HTTP server on port 8080. |
| `README.md` | Brief project description. |

