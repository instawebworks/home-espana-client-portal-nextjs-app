# Changes Log

| Change / Update | Time Taken | Avg Good Developer |
| --------------- | ---------- | ------------------ |
| Renamed portal title from "Document Upload Portal" to "Hipoteken Document Portal" in `PortalPage.jsx`, `LoginForm.jsx`, and `layout.js` (browser tab) | ~2 min | 5 min |
| Added Change Password flow — "Change Password" button in portal header, new `change-password` page with prepopulated current password, 12-char strong password validation checklist (uppercase, lowercase, number, special char), confirm field, POSTs to `/api/auth/change-password` which verifies old password, updates CRM Deal's Portal Password field, clears session, and redirects to login | ~20 min | 3–4 hours |
| Fixed "Update Password" button briefly re-enabling before redirect on success — moved `setSubmitting(false)` out of `finally` into error paths only so button stays disabled through the redirect | ~2 min | 10 min |
