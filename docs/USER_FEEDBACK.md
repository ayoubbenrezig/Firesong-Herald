# User Feedback & Requirements

**Project:** Discord Event Management Bot  
**Stage:** Requirements Gathering  
**Status:** In Progress

## Context

This document captures raw user feedback collected from community members. The goal is to identify pain points and desired features to inform the MVP and future development cycles.

Users were asked informally. Some are non-native English speakers, feedback has been interpreted for intent, not taken literally.

---

## Feedback by User

### User A

**What works well in current tooling**
- Repeating events
- Tags for events
- Auto-posts to channel once admin configures it
- Image attachments on events
- Discord calendar integration

**Pain points**
- Not enough tag spaces
- UI is unreliable, editing an event sometimes requires multiple clicks before it responds
- Users must manually copy/paste timestamps and emojis, no automation
- Edit history / audit log lacks detail
- Deleting old templates or events sends a ping to everyone who was signed up, including users who have already left the server

---

### User B

**Desired features**
- Repeating events
- Event reminders
- Multiple RSVP options per event (e.g. attendee, volunteer)
- Ability for admins to view and edit RSVPs
- Role-based access, assign or restrict by Discord role
- Discord calendar integration
- Daily auto-post showing upcoming events (configurable look-ahead)
- Daily auto-post should ping relevant roles based on which events are happening that day only
- Auto-carry RSVP for repeating events, user remains signed up for next occurrence with option to opt out
- Role-based RSVP grouping, sign-up options can have roles attached, roles assigned on sign-up and removed when event ends
- Host profiles (early idea, details TBD)
- Integration with external announcement system for auto sign-ups (low priority, exploratory)

**Pain points**
- RSVP state breaks on repeating events, clicking the reaction appears to un-RSVP rather than confirm existing RSVP
- Edit flow frequently throws errors and requires repeated attempts
- Image attachment workflow is fragile and requires extra steps from hosts

---

### User C

**Desired features**
- Ping attendees by name, not just by role, for reminders
- Auto-delete event post after event ends, configurable delay (e.g. 24 hours or custom)
- Roll call / attendance marking during an event
- Text formatting in event posts, bold headings etc.
- Direct image attachments in posts, not external links
- Export attendance data, who signed up vs who showed up
- No-show tracking, if a user repeatedly does not show up restrict them to limited sign-up roles
- Personal weekly schedule view for users, private list of their own sign-ups (via DM or private message)
- Role grouping for sign-ups, conditional logic where a user picks one role from Group A and one from Group B, cannot pick two conflicting roles simultaneously
- Image handling, temporary storage tied to event lifetime with a file size limit and auto-delete after event ends

**Pain points**
- Changing the event channel resets the role list if done in the wrong order, no safeguard
- Deleted events are gone permanently, no grace period or recovery window
- Mobile experience is poor, browser-based only
- Multiple RSVP roles exist but cannot be grouped, no way to prevent conflicting role selections
- Premium tier required for core features

**Additional clarification**
- Personal schedule view: not a public list, a private user-only view showing their own sign-ups across servers
- Role grouping: conditional sign-up logic similar to a branching form, e.g. two roles that conflict in timing cannot both be selected

---

## Consolidated Feature List

### Events
- [ ] Create, edit, delete events
- [ ] Repeating / recurring events
- [ ] Tags / categories
- [ ] Direct image attachments (size limit, auto-delete after event)
- [ ] Text formatting in event posts
- [ ] Auto-post to a configured channel
- [ ] Auto-delete post after event ends (configurable delay)
- [ ] Soft delete with grace period before permanent deletion

### RSVPs
- [ ] Multiple RSVP options per event
- [ ] Admin view and edit of RSVPs
- [ ] Auto-carry RSVP for repeating events (opt-out model)
- [ ] Ping attendees by name for reminders
- [ ] Role grouping, conditional and mutually exclusive sign-up options

### Roles & Permissions
- [ ] Assign Discord roles on sign-up
- [ ] Remove Discord roles when event ends
- [ ] Restrict events by role
- [ ] Role-based daily pings (ping only roles relevant to that day's events)

### Attendance
- [ ] Role call during event
- [ ] No-show tracking
- [ ] Export attendance data
- [ ] Restrict repeat no-shows to limited roles

### Scheduling & Calendar
- [ ] Daily auto-post with upcoming events
- [ ] Configurable look-ahead (day ahead, week ahead, etc.)
- [ ] Discord calendar integration
- [ ] Personal weekly schedule view (private, per user)

### Admin & UX
- [ ] Reliable UI with no repeated-click errors
- [ ] Audit log with detailed edit history
- [ ] Safe deletion with no mass pings
- [ ] Mobile-friendly experience
- [ ] Web dashboard for longer text input

### Future / Exploratory
- [ ] Host profiles
- [ ] Cross-server event view for users
- [ ] External announcement system integration

---

*Document created during requirements gathering phase. To be updated as more feedback is collected.*
