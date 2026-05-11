# Changes Log

| Change / Update                                                                                                                                                                           | Time Taken | Avg Good Developer |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------ |
| Skip `/api/upload` call (and thus `Client_Push_Notification` update) when client submits a note with no attachments — wrapped Step 2 in `PortalPage.jsx` with `if (totalFiles > 0)` guard | ~3 min     | 15–25 min          |

| Added chat-style Messages tab to the client portal — `getNotes` in `crm.js`, new `/api/notes` GET endpoint, new `MessagesPanel.jsx` component (chat bubbles, compose box, optimistic send), and `PortalPage.jsx` refactored with MUI Tabs (Documents / Messages); note field removed from document submit flow | ~18 min | 3–5 hours |

| Fixed `getNotes` 400 error — Zoho Notes API requires `?fields=` param; added `Note_Title,Note_Content,Created_Time,Created_By` to the URL; fixed sender name in `MessagesPanel` (all notes go through service account so `Created_By.name` is useless — now shows "Admin" for non-client notes) | ~5 min | 30 min |

| Fixed Messages tab showing empty: moved notes fetch to server-side (`page.js` fetches via `getNotes` in parallel with the submission log record); `MessagesPanel` now accepts `initialNotes` prop and renders from SSR data; removed client-side fetch-on-mount; `MessagesPanel` always mounted (CSS hidden) so state is never lost on tab switch | ~8 min | 45–90 min |
