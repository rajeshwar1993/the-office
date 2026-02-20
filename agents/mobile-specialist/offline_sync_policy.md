# Offline & Synchronization Policy

## 1. The "Cache-First" Strategy
- **Read Logic:** When a user opens a screen, show cached data from [Isar/Hive] immediately while fetching fresh data in the background.
- **Write Logic:** Use an "Outbox" pattern. If the user performs an action (e.g., "Like a photo") while offline, save it locally and sync it when connectivity returns.

## 2. Conflict Resolution
- **Last Write Wins:** For simple data (e.g., profile updates), the most recent timestamp takes priority.
- **Manual Intervention:** For complex data, flag a "Conflict" and ask the user (or escalate to the CEO).

## 3. Connectivity Awareness
- Use the `connectivity_plus` package to monitor status.
- **UI Feedback:** Show a subtle "Offline Mode" banner or indicator. Never block the user from navigating cached screens.