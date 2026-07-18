# Intramural Team Registration — MVP Build Spec

A registration tool for post-secondary intramural sports. This document is the
build brief for the v1 MVP. The single feature is **team registration and
rosters** — nothing else. Keep scope tight; the cut list below is deliberate.

\---

## Goal \& scope

Let an organizer stand up a league, let a captain register a team, let players
join that team's roster, and give the organizer a
single clean view of every team and roster. The current painful alternative is a
Google Form dumping into a spreadsheet that the organizer untangles by hand.

**In scope (v1):**

* Organizer accounts + league creation
* Team creation by a captain, with a shareable join link/code
* Player self-join to a roster via that link
* Enforcement of roster min/max and **one player per league** at the data layer
* Organizer dashboard: all teams in a league, roster status, CSV export
* Registration deadline + manual open/closed toggle per league

**Explicitly OUT of scope (do not build — parked for later):**
Scheduling, standings, brackets/playoffs, payments, free-agent placement,
in-app messaging, native mobile app, multi-sport templates, admin analytics,
co-ed/gender-ratio rules. Every one of these is tempting; none ships in v1.

\---

## Users \& roles

* **Organizer** — the only role with a real (password or magic-link) account.
Creates and owns leagues; sees all teams and rosters. Small number of people.
* **Captain** — a player with `is\_captain = true` on their team; the person who
created the team. Authenticated by magic link. Can share the join link and
(v1) remove players from their own team.
* **Player** — joins a roster via a join link, authenticated by magic link.
No password. Can remove themselves from a roster.

\---

## Core user flows

**Organizer creates a league**
Signs in → creates a league (sport, division, roster min/max, registration
deadline, optional max teams) →
gets a shareable league link.

**Captain registers a team**
Opens a league link → enters team name and their own email → receives magic
link → on click, the team is created and they land as the flagged captain →
gets a join link/code to send teammates.

**Player joins a roster**
Opens the join link → enters name and student email → checks the waiver box →
receives magic link → on click, they are added to the roster, subject to the
rules below.

**Organizer monitors**
Dashboard lists every team in a league with roster status (incomplete / full /
over).

\---

## Data model

Four tables. The relationships and the one unique constraint carry the value.

**organizers**

* `id` (uuid, PK)
* `email` (string, unique)
* `name` (string)

**leagues**

* `id` (uuid, PK)
* `organizer\_id` (uuid, FK → organizers.id)
* `sport` (string)
* `division` (string)          — recreational / competitive / skill tier, etc.
* `roster\_min` (int)
* `roster\_max` (int)
* `max\_teams` (int, nullable)  — null = unlimited
* `reg\_deadline` (date)
* `status` (enum: `open` | `closed`)

**teams**

* `id` (uuid, PK)
* `league\_id` (uuid, FK → leagues.id)
* `name` (string)
* `captain\_email` (string)
* `join\_code` (string, unique) — backs both a short code and a shareable link
* `admission\_status` (enum: `active` | `waitlisted` | `withdrawn`)
* `waitlist\_position` (int, nullable) — order in the league waitlist; null when
`active` or `withdrawn`

Roster fullness (forming vs full) is **derived** from the count of `confirmed`
roster entries versus `roster\_max` — do not store it, to avoid sync bugs.
`admission\_status` is a separate axis: a waitlisted team can still have a full
roster.

**roster\_entries**

* `id` (uuid, PK)
* `team\_id` (uuid, FK → teams.id)
* `player\_email` (string)
* `player\_name` (string)
* `is\_captain` (bool, default false)
* `status` (enum: `confirmed` | `removed`)

**Critical constraint:** a unique index on `(league\_id, player\_email)` across
roster entries — enforced by joining `roster\_entries` to `teams` to reach
`league\_id` (via a generated column, a trigger, or a unique index on a
denormalized `league\_id` copied onto `roster\_entries`; the denormalized column
is simplest). This makes it **impossible** for one email to appear on two teams
in the same league. This is the core anti-frustration guarantee — do not enforce
it in application code alone.

\---

## Business rules

* A player may join only if the team is below `roster\_max` and registration is
`open` and before `reg\_deadline`.
* A player may not join a second team in the same league (see constraint above).
* A team's roster is **full** (derived, not stored) when confirmed roster size
reaches `roster\_max`; a team counts as complete/eligible once size ≥
`roster\_min`.
* On team creation: if `max\_teams` is set and the count of `active` teams already
equals it, create the team as `waitlisted` with the next `waitlist\_position`;
otherwise create it `active`.
* When an active team withdraws, automatically promote the earliest waitlisted
team (lowest `waitlist\_position`) to `active` and shift remaining positions up.
The organizer may also promote a waitlisted team manually.
* Waitlisted teams may still build their rosters while waiting, so they are ready
the moment they are promoted.
* Removing a player sets `status = removed` (soft delete) rather than hard delete,
so history and the unique constraint behave predictably — the unique index
should apply to `confirmed` rows only (partial unique index).

\---

## Architecture

Stack, tooling, MCP usage, and code conventions live in `CLAUDE.md`. This section
covers only architecture decisions.

* **Email:** v1 relies on Supabase's built-in magic-link emails. Custom
transactional emails (e.g. "you're on the roster" confirmations) are deferred
— the app UI confirms success in-session for v1.

**Auth model.** Organizers get accounts. Captains and players authenticate by
**magic link** (passwordless): they enter an email, receive a one-time link,
click it, and are logged in — which also verifies the email that powers
eligibility and the one-team constraint. No passwords for captains or players.
Use Supabase's built-in magic-link (OTP) auth; do not hand-roll tokens.

**RLS.** Organizers can read/write only leagues they own and the teams/rosters
beneath them. Players/captains can read the league they're joining and write only
their own roster entry / their own team. Enforce with Supabase RLS policies, not
just application checks.

\---

## Build order (vertical slices)

Build in this order so every slice is clickable end-to-end. Never leave a layer
half-built with nothing to demo.

1. **Organizer auth + create league.** Sign-in works; one form writes a league
row. Confirm RLS: an organizer sees only their own leagues.
2. **Captain creates a team.** From a league link, a captain enters a team name
and email, authenticates by magic link, and gets a team with a unique
`join\_code` and a shareable join link.
3. **Player join flow (the core).** Join link → name + email →
magic link → roster entry created, with `roster\_max`, deadline/open-closed,
domain restriction, and the one-team-per-league constraint all enforced. This
slice must feel effortless; it is where the product's value lives.
4. **Organizer dashboard.** All teams in a league with roster status
(incomplete / full / over) and admission status (active / waitlisted), the
waitlist shown in order with a manual-promote action, and CSV export of
rosters.
5. **Deadline + open/closed toggle.** Organizer can open and close registration
and set/enforce the deadline.

Minimal roster editing to include in v1: captain removes a player from their own
team; organizer removes any player or withdraws a team; player removes
themselves. All as soft deletes (`status = removed`).

\---

## Definition of done (v1)

* An organizer can create a league and share its link.
* A captain can create a team from that link and get a working join link/code.
* A player can join a roster in under \~60 seconds with no
password.
* It is impossible to exceed `roster\_max`, join after the deadline/when closed,
or appear on two teams in one league.
* The organizer sees every team and roster in one dashboard and can export CSV.
* When a league is at its team cap, new teams are waitlisted and the earliest is
auto-promoted (FIFO) when an active team withdraws.

If all of the above hold and the join flow is pleasant, v1 is done. The next
feature (likely scheduling or standings) is chosen only after running one real
season through the tool.

