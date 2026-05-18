"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, Paper, Snackbar, Tab, Tabs, Typography } from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import DocumentItem from "@/components/DocumentItem";
import MessagesPanel from "@/components/MessagesPanel";

function getFirstName(fullName) {
  return fullName.split(" ")[0];
}

function getDocStatus(docName, documentUploads, scanType, applicantName, docSectionApproval) {
  if (docSectionApproval?.section === true) return "APPROVED";

  const rows = (documentUploads ?? []).filter(
    (r) => r.Document_Type === docName && r.Submitted_For === applicantName
  );
  if (rows.length === 0) return "NOT SUBMITTED";

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
  const documentRequirements = (templateJson?.documentRequirements ?? []).filter((doc) => doc.checked);

  const applicants = (submissionLog?.Applicants_Listing ?? "")
    .split(";")
    .map((n) => n.trim())
    .filter(Boolean);

  const messagesTabIndex = applicants.length;

  const clientName =
    crmRecord?.Full_Name ||
    crmRecord?.Contact_Name?.name ||
    crmRecord?.Deal_Name ||
    "You";

  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  // { [applicantIdx]: { [docId]: { [slot]: File[] } } }
  const [filesByApplicant, setFilesByApplicant] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [currentLog, setCurrentLog] = useState(submissionLog);

  const sectionApprovalsMap = (() => {
    const raw = currentLog?.Section_Approvals;
    if (!raw) return {};
    try { return typeof raw === "string" ? JSON.parse(raw) : (raw ?? {}); }
    catch { return {}; }
  })();
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  function handleTabChange(_, newTab) {
    setTab(newTab);
    setExpandedId(null);
    setSubmitError(null);
  }

  function handleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function handleSlotChange(applicantIdx, docId, slot, updater) {
    setFilesByApplicant((prev) => {
      const byDoc = prev[applicantIdx] ?? {};
      const docSlots = byDoc[docId] ?? {};
      const updated = {
        ...prev,
        [applicantIdx]: { ...byDoc, [docId]: { ...docSlots, [slot]: updater(docSlots[slot] ?? []) } },
      };
      const totalFiles = Object.values(updated).reduce(
        (sum, bd) => sum + Object.values(bd).reduce((s, slots) => s + Object.values(slots).reduce((ss, arr) => ss + arr.length, 0), 0),
        0
      );
      if (totalFiles > 0) setSubmitError(null);
      return updated;
    });
  }

  async function handleSubmit() {
    const totalFiles = Object.values(filesByApplicant).reduce(
      (sum, bd) => sum + Object.values(bd).reduce((s, slots) => s + Object.values(slots).reduce((ss, arr) => ss + arr.length, 0), 0),
      0
    );
    if (totalFiles === 0) {
      setSubmitError("Please attach at least one file before submitting.");
      return;
    }

    setSubmitError(null);
    setSubmitting(true);
    try {
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
        setSnackbar({ open: true, message: "Submission failed. Please try again.", severity: "error" });
        return;
      }

      const uploadFormData = new FormData();
      uploadFormData.append("submissionLogId", data.submissionLogId);
      uploadFormData.append("existingUploads", JSON.stringify(currentLog?.Document_Uploads ?? []));

      const metadata = [];
      for (const [applicantIdxStr, filesForApplicant] of Object.entries(filesByApplicant)) {
        const applicantName = applicants[Number(applicantIdxStr)];
        if (!applicantName) continue;
        for (const doc of documentRequirements) {
          const slots = filesForApplicant[doc.id] ?? {};
          for (const [scanType, files] of Object.entries(slots)) {
            for (const file of files) {
              uploadFormData.append("file", file);
              metadata.push({ docName: doc.name, scanType, submittedFor: applicantName });
            }
          }
        }
      }
      uploadFormData.append("metadata", JSON.stringify(metadata));

      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadFormData });

      if (!uploadRes.ok) {
        setSnackbar({ open: true, message: "Files could not be uploaded. Please try again.", severity: "error" });
        return;
      }

      setFilesByApplicant({});
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
          position: "relative",
        }}
      >
        <Typography variant="h4" fontWeight={700} color="text.primary">
          Hipoteken Document Portal
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Please upload / review the required documents below
        </Typography>
        <Button
          size="small"
          startIcon={<LockResetIcon />}
          onClick={() => router.push(`/${templateId}/${module}/${recordId}/change-password`)}
          variant="outlined"
          sx={{ position: "absolute", top: "50%", right: 16, transform: "translateY(-50%)" }}
        >
          Change Password
        </Button>
      </Box>

      {/* Page body */}
      <Box sx={{ maxWidth: 800, mx: "auto", px: 2, py: 2 }}>
        {/* Welcome */}
        <Paper variant="outlined" sx={{ px: 3, py: 2, mb: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Welcome, {clientName}!
          </Typography>
        </Paper>

        {/* Dynamic tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2.5 }}>
          <Tabs value={tab} onChange={handleTabChange}>
            {applicants.map((name) => (
              <Tab key={name} label={`${getFirstName(name)}'s Documents`} />
            ))}
            <Tab label="Messages" />
          </Tabs>
        </Box>

        {/* Applicant document tabs */}
        {applicants.map((applicantName, applicantIdx) => (
          <Box key={applicantName} sx={{ display: tab === applicantIdx ? "block" : "none" }}>
            {documentRequirements.map((doc) => (
              <DocumentItem
                key={doc.id}
                name={doc.name}
                requirement={doc.requirement}
                scanType={doc.scanType}
                status={getDocStatus(doc.name, currentLog?.Document_Uploads, doc.scanType, applicantName, sectionApprovalsMap[doc.name])}
                additionalInstructions={doc.additionalInstructions}
                expanded={expandedId === doc.id}
                onChange={() => handleExpand(doc.id)}
                fileSlots={(filesByApplicant[applicantIdx] ?? {})[doc.id] ?? {}}
                onSlotChange={(slot, updater) => handleSlotChange(applicantIdx, doc.id, slot, updater)}
                previousUploads={(currentLog?.Document_Uploads ?? []).filter(
                  (u) => u.Document_Type === doc.name && u.Submitted_For === applicantName
                )}
                fileTypes={doc.fileTypes ?? []}
                sectionApprovals={sectionApprovalsMap[doc.name] ?? {}}
              />
            ))}
          </Box>
        ))}

        {/* Single global submit button — collects files from all applicant tabs */}
        {tab !== messagesTabIndex && (
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
        )}

        {/* Messages tab — always mounted so state is preserved */}
        <Box sx={{ display: tab === messagesTabIndex ? "block" : "none" }}>
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
