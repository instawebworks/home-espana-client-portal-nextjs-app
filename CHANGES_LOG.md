# Changes Log

| Change / Update | Time Taken | Avg Good Developer |
| --------------- | ---------- | ------------------ |
| Per-applicant scoping for broker-requested docs: a documentRequirements entry may carry an optional `forApplicants` array (applicant display names); rows with it render only on those applicants' tabs, rows without it stay universal. Added `isReqForApplicant` helper and filtered the applicant-tab render loop by it. Contract shared with the CRM widget which writes the key | ~5 min | ~30 min |
| Hide "Required Information" form upload button once a form has been received (client may upload only once) | ~3 min | ~20 min |
| Move Option 1 & 2 (application form intro + download/re-upload + online webform) out of Instructions into a new "Application Form" tab in 2nd position; reindex applicant/Messages tabs | ~6 min | ~30 min |
| Embed Zoho webform inline (iframe) in Option 2 instead of "Open the online form" button, so client submits without leaving the portal; kept ?id=recordId prefill | ~4 min | ~20 min |
| Project-wide mobile responsiveness pass: scrollable portal tabs, non-overlapping responsive header (Change Password button), responsive h4 title, DocumentItem status no longer squeezed by long names, explicit viewport meta; verified login at 375px | ~15 min | ~1.5 hr |
| Scope admin reference uploads to each applicant's own tab by filtering Admin_Uploads on Uploaded_For === applicantName (was shown on every applicant tab) | ~5 min | ~25 min |
| Align portal with the widget's new per-applicant Section_Approvals schema (`{ "<Applicant>": { "<Section>": true } }`): a document row shows APPROVED (and its upload zone locks) only when the broker has signed off that section for that specific applicant, no longer from a shared per-section flag. Added normalizeSectionApprovals with legacy-format migration (old `{Section:{section/front&back:true}}` read as approved for every applicant); DocumentItem now takes a single `sectionApproved` boolean (per-side front/back approval flags removed — one sign-off covers both sides). Contract shared with the CRM widget which writes the field | ~10 min | ~1.5 hr |
