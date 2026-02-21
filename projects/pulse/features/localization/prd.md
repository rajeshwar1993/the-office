# PRD: Globalization & Persistent Localization (v1.0)

**Project Status:** Technical Specification  
**Core Objective:** Decouple UI strings from the codebase to support multi-language scalability and ensure user language preferences persist across devices.

---

## 1. Technical Architecture: The i18n Framework

### 1.1 Config-Based String Management
* **Format:** Use standardized `JSON` files for language definitions (e.g., `en.json`).
* **Nested Structure:** Organize strings by feature or screen to prevent key collisions.
* **Variable Support:** Use placeholders (e.g., `{{name}}`) for dynamic content to handle varied grammar rules across languages.
* **Hardcode Ban:** Total prohibition of hardcoded strings in the UI layer. All text must be accessed via a localization key/function (e.g., `t('dashboard.safe_status')`).

### 1.2 Data Persistence Logic
To ensure a seamless user experience, the language setting must be stored in two locations:
1.  **Local Storage (App):** Ensures the app loads in the correct language immediately upon launch, even without an internet connection.
2.  **Profiles Table (Supabase):** Acts as the "Cloud Source of Truth" so that preferences persist when a user switches devices.

---

## 2. Functional Requirements

### 2.1 Bootstrapping & Sync Logic
* **Initialization:** On launch, the app checks Local Storage for a `language_code`. If null, it defaults to the device's system language (falling back to `en` if unsupported).
* **Profile Sync:** After authentication, the app fetches the `language_preference` from the Supabase profile. If it differs from Local Storage, the UI updates to match the server-side preference.

### 2.2 Language Switcher UI
* **Location:** Accessible via the "Settings" menu.
* **Native Naming:** Each language option must be displayed in its native script (e.g., "English", "हिन्दी").
* **Instant Update:** Switching the language must trigger an immediate UI re-render without requiring an app restart.
* **Background Write:** Upon selection, the new code is written to Local Storage and patched to the Supabase `profiles` table via an async call.

---

## 3. Configuration Schema (Sample `en.json`)

```json
{
  "common": {
    "ok": "OK",
    "cancel": "Cancel",
    "save": "Save",
    "continue": "Continue"
  },
  "auth": {
    "welcome": "Welcome back",
    "magic_link_sent": "Check your email for your magic link"
  },
  "dashboard": {
    "pulse_animation_text": "Sending your Pulse...",
    "status_safe": "{{name}} is okay",
    "seen_receipt": "Seen your pulse ❤️",
    "ghost_calendar_header": "Reliability Streak: {{days}} Days"
  },
  "settings": {
    "header": "Settings",
    "lang_selector": "App Language",
    "active_lang": "English"
  }
}
```
---

### 4. Database Schema Update (Supabase)

To support persistent language preferences, the following column must be added to the `profiles` table. This ensures that the user's selection is restored even after re-installing the app or switching devices.

| Column Name | Data Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `language_preference` | `text` | `'en'` | ISO 639-1 language code (e.g., 'en', 'hi', 'ja'). |
