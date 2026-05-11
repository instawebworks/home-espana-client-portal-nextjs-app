"use client";

import { useState } from "react";
import { Alert, Box, Button, Paper, Snackbar, Tab, Tabs, Typography } from "@mui/material";
import DocumentItem from "@/components/DocumentItem";
import MessagesPanel from "@/components/MessagesPanel";

function getDocStatus(docName, documentUploads, scanType) {
  const rows = (documentUploads ?? []).filter((r) => r.Document_Type === docName);
  if (rows.length === 0) return "NOT SUBMITTED";

  let approved;
  if (scanType === "Front & Back") {
    const frontApproved = rows.filter((r) => r.Scan_Type === "Front").some((r) => r.Approval_Status === "Approved");
    const backApproved = rows.filter((r) => r.Scan_Type === "Back").some((r) => r.Approval_Status === "Approved");
    approved = frontApproved && backApproved;
  } else {
    approved = rows.some((r) => r.Approval_Status === "Approved");
  }

  if (approved) return "APPROVED";
  if (rows.some((r) => r.Approval_Status === "Pending")) return "PENDING";
  if (rows.every((r) => r.Approval_Status === "Rejected")) return "REJECTED";
  return "PENDING";
}

export default function PortalPage({
  templateId,
  module,
  recordId,
  templateJson,
  crmRecord,
  submissionLog,
  initialNotes = [],
}) {
  const documentRequirements = (
    templateJson?.documentRequirements ?? []
  ).filter((doc) => doc.checked);

  const clientName =
    crmRecord?.Full_Name ||
    crmRecord?.Contact_Name?.name ||
    crmRecord?.Deal_Name ||
    "You";

  const [tab, setTab] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [filesByDoc, setFilesByDoc] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [currentLog, setCurrentLog] = useState(submissionLog);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  function handleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function handleSlotChange(docId, slot, updater) {
    setFilesByDoc((prev) => {
      const docSlots = prev[docId] ?? {};
      const updated = { ...prev, [docId]: { ...docSlots, [slot]: updater(docSlots[slot] ?? []) } };
      const totalFiles = Object.values(updated).reduce(
        (sum, slots) => sum + Object.values(slots).reduce((s, arr) => s + arr.length, 0),
        0
      );
      if (totalFiles > 0) setSubmitError(null);
      return updated;
    });
  }

  async function handleSubmit() {
    const totalFiles = Object.values(filesByDoc).reduce(
      (sum, slots) => sum + Object.values(slots).reduce((s, arr) => s + arr.length, 0),
      0
    );
    if (totalFiles === 0) {
      setSubmitError("Please attach at least one file before submitting.");
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
        const slots = filesByDoc[doc.id] ?? {};
        for (const [scanType, files] of Object.entries(slots)) {
          for (const file of files) {
            uploadFormData.append("file", file);
            metadata.push({ docName: doc.name, scanType });
          }
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

      // Step 3: clear files, then re-fetch the updated submission log
      setFilesByDoc({});
      const logRes = await fetch(`/api/submission-log?id=${data.submissionLogId}`);
      const logData = await logRes.json();
      if (logRes.ok) setCurrentLog(logData.record);
      setSnackbar({ open: true, message: "Documents submitted successfully!", severity: "success" });
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
          py: 2,
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
        <Paper variant="outlined" sx={{ px: 3, py: 2, mb: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Welcome, {clientName}!
          </Typography>
        </Paper>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2.5 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Documents" />
            <Tab label="Messages" />
          </Tabs>
        </Box>

        {/* Documents tab */}
        {tab === 0 && (
          <>
            {documentRequirements.map((doc) => (
              <DocumentItem
                key={doc.id}
                name={doc.name}
                requirement={doc.requirement}
                scanType={doc.scanType}
                status={getDocStatus(doc.name, currentLog?.Document_Uploads, doc.scanType)}
                additionalInstructions={doc.additionalInstructions}
                expanded={expandedId === doc.id}
                onChange={() => handleExpand(doc.id)}
                fileSlots={filesByDoc[doc.id] ?? {}}
                onSlotChange={(slot, updater) => handleSlotChange(doc.id, slot, updater)}
                previousUploads={(currentLog?.Document_Uploads ?? []).filter((u) => u.Document_Type === doc.name)}
                submissionLogId={currentLog?.id}
                fileTypes={doc.fileTypes ?? []}
              />
            ))}

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
          </>
        )}

        {/* Messages tab — always mounted so initialNotes state is preserved */}
        <Box sx={{ display: tab === 1 ? "block" : "none" }}>
          <MessagesPanel
            submissionLogId={currentLog?.id}
            templateId={templateId}
            module={module}
            recordId={recordId}
            clientName={clientName}
            initialNotes={initialNotes}
            onLogCreated={(id) => setCurrentLog((prev) => prev ?? { id, Document_Uploads: [] })}
          />
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
