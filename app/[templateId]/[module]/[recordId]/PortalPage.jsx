"use client";

import { useState } from "react";
import { Alert, Box, Button, Paper, Snackbar, TextField, Typography } from "@mui/material";
import DocumentItem from "@/components/DocumentItem";

// Derives status for a document type from the Document_Uploads subform rows.
// Priority: Rejected > Pending > Approved > NOT SUBMITTED
function getDocStatus(docName, documentUploads) {
  const rows = (documentUploads ?? []).filter((r) => r.Document_Type === docName);
  if (rows.length === 0) return "NOT SUBMITTED";
  if (rows.some((r) => r.Approval_Status === "Pending")) return "PENDING";
  if (rows.every((r) => r.Approval_Status === "Rejected")) return "REJECTED";
  if (rows.every((r) => r.Approval_Status === "Approved")) return "APPROVED";
  return "PENDING";
}

export default function PortalPage({
  templateId,
  module,
  recordId,
  templateJson,
  crmRecord,
  submissionLog,
}) {
  const documentRequirements = (
    templateJson?.documentRequirements ?? []
  ).filter((doc) => doc.checked);
  const [expandedId, setExpandedId] = useState(null);
  const [filesByDoc, setFilesByDoc] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [currentLog, setCurrentLog] = useState(submissionLog);
  const [note, setNote] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  function handleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function handleFilesChange(docId, updater) {
    setFilesByDoc((prev) => {
      const updated = { ...prev, [docId]: updater(prev[docId] ?? []) };
      const totalFiles = Object.values(updated).reduce((sum, arr) => sum + arr.length, 0);
      if (totalFiles > 0) setSubmitError(null);
      return updated;
    });
  }

  async function handleSubmit() {
    const totalFiles = Object.values(filesByDoc).reduce((sum, arr) => sum + arr.length, 0);
    const hasNote = note.trim().length > 0;
    if (totalFiles === 0 && !hasNote) {
      setSubmitError("Please attach at least one file or add a note before submitting.");
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    try {
      // Step 1: get or create the submission log record
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          module,
          recordId,
          submissionLogId: currentLog?.id ?? null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Submit failed:", data.error);
        setSnackbar({ open: true, message: "Submission failed. Please try again.", severity: "error" });
        return;
      }

      // Step 2: upload files + update Document_Uploads subform
      const uploadFormData = new FormData();
      uploadFormData.append("submissionLogId", data.submissionLogId);
      uploadFormData.append("existingUploads", JSON.stringify(currentLog?.Document_Uploads ?? []));

      const metadata = [];
      for (const doc of documentRequirements) {
        for (const file of filesByDoc[doc.id] ?? []) {
          uploadFormData.append("file", file);
          metadata.push({ docName: doc.name });
        }
      }
      uploadFormData.append("metadata", JSON.stringify(metadata));

      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadFormData });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        console.error("Upload failed:", uploadData.error);
        setSnackbar({ open: true, message: "Files could not be uploaded. Please try again.", severity: "error" });
        return;
      }

      // Step 3: create note if provided
      if (note.trim()) {
        await fetch("/api/note", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submissionLogId: data.submissionLogId, content: note.trim() }),
        });
        setNote("");
      }

      // Step 4: clear files, then re-fetch the updated submission log
      setFilesByDoc({});
      const logRes = await fetch(`/api/submission-log?id=${data.submissionLogId}`);
      const logData = await logRes.json();
      if (logRes.ok) setCurrentLog(logData.record);
      setSnackbar({ open: true, message: "Submission successful!", severity: "success" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" fontWeight={700} color="text.primary">
          Document Upload Portal
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Please upload / review the required documents below
        </Typography>
      </Box>

      {/* Page body */}
      <Box sx={{ maxWidth: 800, mx: "auto", px: 2, py: 2 }}>
        {/* Welcome section */}
        <Paper variant="outlined" sx={{ px: 3, py: 2, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Welcome, {crmRecord?.Full_Name}!
          </Typography>
        </Paper>

        {/* Document checklist */}
        {documentRequirements.map((doc) => (
          <DocumentItem
            key={doc.id}
            name={doc.name}
            status={getDocStatus(doc.name, currentLog?.Document_Uploads)}
            additionalInstructions={doc.additionalInstructions}
            expanded={expandedId === doc.id}
            onChange={() => handleExpand(doc.id)}
            files={filesByDoc[doc.id] ?? []}
            onFilesChange={(updater) => handleFilesChange(doc.id, updater)}
            previousUploads={(currentLog?.Document_Uploads ?? []).filter((u) => u.Document_Type === doc.name)}
            submissionLogId={currentLog?.id}
          />
        ))}

        {/* Additional note */}
        <Paper variant="outlined" sx={{ px: 3, py: 2.5, mt: 1 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
            Additional Note (Optional)
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder="Add any notes or comments..."
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              if (e.target.value.trim()) setSubmitError(null);
            }}
          />
        </Paper>

        {/* Submit */}
        <Box sx={{ textAlign: "center", mt: 3, mb: 4 }}>
          {submitError && (
            <Typography variant="body2" color="error" sx={{ mb: 1.5 }}>
              {submitError}
            </Typography>
          )}
          <Button
            variant="contained"
            size="large"
            sx={{ px: 5 }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Documents"}
          </Button>
        </Box>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
