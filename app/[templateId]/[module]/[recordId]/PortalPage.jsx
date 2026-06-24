"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Paper,
  Snackbar,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import EditNoteIcon from "@mui/icons-material/EditNote";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DocumentItem from "@/components/DocumentItem";
import MessagesPanel from "@/components/MessagesPanel";

function getFirstName(fullName) {
  return fullName.split(" ")[0];
}

function formatUploadDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function getDocStatus(
  docName,
  documentUploads,
  scanType,
  applicantName,
  docSectionApproval,
) {
  if (docSectionApproval?.section === true) return "APPROVED";

  const rows = (documentUploads ?? []).filter(
    (r) => r.Document_Type === docName && r.Submitted_For === applicantName,
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
  requiredInfoUploads = [],
}) {
  const documentRequirements = (
    templateJson?.documentRequirements ?? []
  ).filter((doc) => doc.checked);

  const applicants = (submissionLog?.Applicants_Listing ?? "")
    .split(";")
    .map((n) => n.trim())
    .filter(Boolean);

  const instructionsTabIndex = 0;
  const messagesTabIndex = applicants.length + 1;

  const clientName =
    crmRecord?.Full_Name ||
    crmRecord?.Contact_Name?.name ||
    crmRecord?.Deal_Name ||
    "You";

  const greetingName =
    clientName && clientName !== "You" ? getFirstName(clientName) : null;

  // Zoho webform (Option 2). The Deal ID is passed as `id` so the submission
  // can be linked back to this record.
  const webformUrl = `https://forms.zohopublic.eu/Hipoteken/form/Requiredinformation1/formperma/pjyGLWLvEkK4-n98pKWe1yjfMS3evvivEKhIyJ9IaPg?id=${encodeURIComponent(
    recordId,
  )}`;

  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  // { [applicantIdx]: { [docId]: { [slot]: File[] } } }
  const [filesByApplicant, setFilesByApplicant] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [currentLog, setCurrentLog] = useState(submissionLog);

  // Re-upload of the filled "Required Information" form (Part 2)
  const [reuploadFile, setReuploadFile] = useState(null);
  const [reuploading, setReuploading] = useState(false);

  const sectionApprovalsMap = (() => {
    const raw = currentLog?.Section_Approvals;
    if (!raw) return {};
    try {
      return typeof raw === "string" ? JSON.parse(raw) : (raw ?? {});
    } catch {
      return {};
    }
  })();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  function handleTabChange(_, newTab) {
    setTab(newTab);
    setExpandedId(null);
    setSubmitError(null);
  }

  async function handleRequiredInfoReupload() {
    if (!reuploadFile) return;
    setReuploading(true);
    try {
      const fd = new FormData();
      fd.append("module", module);
      fd.append("recordId", recordId);
      fd.append("file", reuploadFile);
      const res = await fetch("/api/required-info/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      setReuploadFile(null);
      setSnackbar({
        open: true,
        message: "Your completed form has been uploaded. Thank you!",
        severity: "success",
      });
      // Re-fetch server data so the newly uploaded form shows in the list.
      router.refresh();
    } catch {
      setSnackbar({
        open: true,
        message: "Sorry, the upload failed. Please try again.",
        severity: "error",
      });
    } finally {
      setReuploading(false);
    }
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
        [applicantIdx]: {
          ...byDoc,
          [docId]: { ...docSlots, [slot]: updater(docSlots[slot] ?? []) },
        },
      };
      const totalFiles = Object.values(updated).reduce(
        (sum, bd) =>
          sum +
          Object.values(bd).reduce(
            (s, slots) =>
              s + Object.values(slots).reduce((ss, arr) => ss + arr.length, 0),
            0,
          ),
        0,
      );
      if (totalFiles > 0) setSubmitError(null);
      return updated;
    });
  }

  async function handleSubmit() {
    const totalFiles = Object.values(filesByApplicant).reduce(
      (sum, bd) =>
        sum +
        Object.values(bd).reduce(
          (s, slots) =>
            s + Object.values(slots).reduce((ss, arr) => ss + arr.length, 0),
          0,
        ),
      0,
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
        setSnackbar({
          open: true,
          message: "Submission failed. Please try again.",
          severity: "error",
        });
        return;
      }

      const uploadFormData = new FormData();
      uploadFormData.append("submissionLogId", data.submissionLogId);
      uploadFormData.append(
        "existingUploads",
        JSON.stringify(currentLog?.Document_Uploads ?? []),
      );

      const metadata = [];
      for (const [applicantIdxStr, filesForApplicant] of Object.entries(
        filesByApplicant,
      )) {
        const applicantName = applicants[Number(applicantIdxStr)];
        if (!applicantName) continue;
        for (const doc of documentRequirements) {
          const slots = filesForApplicant[doc.id] ?? {};
          for (const [scanType, files] of Object.entries(slots)) {
            for (const file of files) {
              uploadFormData.append("file", file);
              metadata.push({
                docName: doc.name,
                scanType,
                submittedFor: applicantName,
              });
            }
          }
        }
      }
      uploadFormData.append("metadata", JSON.stringify(metadata));

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadRes.ok) {
        setSnackbar({
          open: true,
          message: "Files could not be uploaded. Please try again.",
          severity: "error",
        });
        return;
      }

      setFilesByApplicant({});
      const logRes = await fetch(
        `/api/submission-log?id=${data.submissionLogId}`,
      );
      const logData = await logRes.json();
      if (logRes.ok) setCurrentLog(logData.record);
      setSnackbar({
        open: true,
        message: "Documents submitted successfully!",
        severity: "success",
      });
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
          onClick={() =>
            router.push(`/${templateId}/${module}/${recordId}/change-password`)
          }
          variant="outlined"
          sx={{
            position: "absolute",
            top: "50%",
            right: 16,
            transform: "translateY(-50%)",
          }}
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
            <Tab label="Instructions" />
            {applicants.map((name) => (
              <Tab key={name} label={`${getFirstName(name)}'s Documents`} />
            ))}
            <Tab label="Messages" />
          </Tabs>
        </Box>

        {/* Instructions tab */}
        <Box sx={{ display: tab === instructionsTabIndex ? "block" : "none" }}>
          {/* ── Part 1: Required information intro ── */}
          <Paper variant="outlined" sx={{ px: 3, py: 2.5, mb: 2 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Hi {greetingName || "there"},
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Here's the information we need from you to ensure your details are
              correct before sharing them with the banks. To give us that
              information, you have two options:
            </Typography>
            <Box
              component="ol"
              sx={{ pl: 2.5, mt: 1.5, mb: 0, color: "text.secondary" }}
            >
              <li>
                <Typography variant="body2" component="span">
                  Either <strong>download the form below</strong>, fill it out
                  and re-upload it, <em>or</em>
                </Typography>
              </li>
              <li>
                <Typography variant="body2" component="span">
                  Fill out the <strong>webform below</strong> and we'll have the
                  information sent directly to us once you finish.
                </Typography>
              </li>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1.5, fontStyle: "italic" }}
            >
              You only need to complete one of these two options.
            </Typography>
          </Paper>

          {/* ── Part 2: Preuploaded document (download / re-upload) ── */}
          <Paper variant="outlined" sx={{ p: 0, mb: 2, overflow: "hidden" }}>
            <Box
              sx={{
                px: 3,
                py: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <DescriptionIcon fontSize="small" />
              <Typography variant="subtitle1" fontWeight={700}>
                Option 1 — Download, fill in &amp; re-upload the form
              </Typography>
            </Box>

            <Box sx={{ px: 3, py: 2.5 }}>
              {/* Step 1 — download */}
              <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
                <Box
                  sx={{
                    flexShrink: 0,
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontSize: 14,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  1
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    Download the form
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5 }}
                  >
                    Open the form, then fill in your details. You can complete it
                    on your computer or print it and fill it in by hand.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    component="a"
                    href="/credit-application-form.pdf"
                    download="Hipoteken Application Form.pdf"
                  >
                    Download the form
                  </Button>
                </Box>
              </Box>

              {/* Step 2 — upload */}
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Box
                  sx={{
                    flexShrink: 0,
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontSize: 14,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  2
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    Upload your completed form
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5 }}
                  >
                    Once you've filled it in, upload the completed file (PDF) back
                    to us here.
                  </Typography>

                  {/* Already-uploaded forms */}
                  {requiredInfoUploads.length > 0 && (
                    <Box
                      sx={{
                        mb: 2,
                        border: 1,
                        borderColor: "success.light",
                        bgcolor: "rgba(56, 142, 60, 0.08)",
                        borderRadius: 1,
                        px: 2,
                        py: 1.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="success.dark"
                        fontWeight={700}
                        sx={{ display: "block", mb: 0.5 }}
                      >
                        {requiredInfoUploads.length === 1
                          ? "Form received"
                          : "Forms received"}
                      </Typography>
                      {requiredInfoUploads.map((f) => (
                        <Box
                          key={f.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            py: 0.25,
                          }}
                        >
                          <CheckCircleIcon
                            sx={{ fontSize: 18, color: "success.main" }}
                          />
                          <Typography variant="body2" sx={{ flexGrow: 1 }}>
                            {f.name}
                          </Typography>
                          {f.time && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatUploadDate(f.time)}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1.5,
                      alignItems: "center",
                    }}
                  >
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadFileIcon />}
                    >
                      {reuploadFile
                        ? "Choose a different file"
                        : requiredInfoUploads.length > 0
                          ? "Upload another file"
                          : "Choose your filled form"}
                      <input
                        type="file"
                        hidden
                        accept="application/pdf"
                        onChange={(e) =>
                          setReuploadFile(e.target.files?.[0] ?? null)
                        }
                      />
                    </Button>

                    {reuploadFile && (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {reuploadFile.name}
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={handleRequiredInfoReupload}
                          disabled={reuploading}
                        >
                          {reuploading ? "Uploading…" : "Upload completed form"}
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* ── Part 3: Online webform ── */}
          <Paper variant="outlined" sx={{ p: 0, mb: 2, overflow: "hidden" }}>
            <Box
              sx={{
                px: 3,
                py: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <EditNoteIcon fontSize="small" />
              <Typography variant="subtitle1" fontWeight={700}>
                Option 2 — Fill in the form online
              </Typography>
            </Box>

            <Box sx={{ px: 3, py: 2.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Prefer not to download anything? You can complete the same
                information in a quick online form. It opens in a new tab, and
                once you submit it your details come straight through to us — no
                upload needed.
              </Typography>
              <Button
                variant="contained"
                endIcon={<OpenInNewIcon />}
                component="a"
                href={webformUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open the online form
              </Button>
            </Box>
          </Paper>

          {/* ── Using the rest of the portal (folded-in navigation tips) ── */}
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ display: "block", mt: 3, mb: 1 }}
          >
            Using the rest of the portal
          </Typography>

          <Paper variant="outlined" sx={{ px: 3, py: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Navigating the portal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Each applicant has their own tab (for example{" "}
              <strong>John's Documents</strong> and{" "}
              <strong>Ana's Documents</strong>). Open the tab for the applicant
              whose documents you're uploading, then click any document row to
              expand it and see what's needed.
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ px: 3, py: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Document status
            </Typography>
            <Box
              component="ul"
              sx={{ pl: 2.5, m: 0, color: "text.secondary" }}
            >
              <li>
                <Typography variant="body2" component="span">
                  <strong>NOT SUBMITTED</strong> — nothing uploaded yet.
                </Typography>
              </li>
              <li>
                <Typography variant="body2" component="span">
                  <strong>PENDING</strong> — uploaded and waiting for our review.
                </Typography>
              </li>
              <li>
                <Typography variant="body2" component="span">
                  <strong>APPROVED</strong> — accepted by our team, nothing
                  more needed.
                </Typography>
              </li>
              <li>
                <Typography variant="body2" component="span">
                  <strong>REJECTED</strong> — please check the note from our
                  team and upload a corrected file.
                </Typography>
              </li>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ px: 3, py: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Uploading documents
            </Typography>
            <Box
              component="ol"
              sx={{ pl: 2.5, m: 0, color: "text.secondary" }}
            >
              <li>
                <Typography variant="body2" component="span">
                  Open the tab for the applicant the document belongs to.
                </Typography>
              </li>
              <li>
                <Typography variant="body2" component="span">
                  Click a document row to expand it.
                </Typography>
              </li>
              <li>
                <Typography variant="body2" component="span">
                  Choose the file(s) for each side (front / back, where
                  applicable).
                </Typography>
              </li>
              <li>
                <Typography variant="body2" component="span">
                  When you've selected everything you'd like to send, click{" "}
                  <strong>Submit Documents</strong> at the bottom of the page.
                </Typography>
              </li>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1.5 }}
            >
              You can prepare uploads for more than one applicant in the same
              submission — your selections are kept as you switch between tabs.
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ px: 3, py: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Reference documents from our team
            </Typography>
            <Typography variant="body2" color="text.secondary">
              If our team has shared example or reference files for a
              particular document, you'll see them in an amber section inside
              that document. You can view them online or save a copy.
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ px: 3, py: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Messages
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use the <strong>Messages</strong> tab to chat with our team if
              you have any questions about a document or the application
              overall — we'll reply here.
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ px: 3, py: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Password & security
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use <strong>Change Password</strong> at the top right if you'd
              like to update your portal password. For your security, your
              session expires after 30 minutes of inactivity — just log in
              again to continue.
            </Typography>
          </Paper>
        </Box>

        {/* Applicant document tabs */}
        {applicants.map((applicantName, applicantIdx) => (
          <Box
            key={applicantName}
            sx={{ display: tab === applicantIdx + 1 ? "block" : "none" }}
          >
            {documentRequirements.map((doc) => (
              <DocumentItem
                key={doc.id}
                name={doc.name}
                requirement={doc.requirement}
                scanType={doc.scanType}
                status={getDocStatus(
                  doc.name,
                  currentLog?.Document_Uploads,
                  doc.scanType,
                  applicantName,
                  sectionApprovalsMap[doc.name],
                )}
                additionalInstructions={doc.additionalInstructions}
                expanded={expandedId === doc.id}
                onChange={() => handleExpand(doc.id)}
                fileSlots={
                  (filesByApplicant[applicantIdx] ?? {})[doc.id] ?? {}
                }
                onSlotChange={(slot, updater) =>
                  handleSlotChange(applicantIdx, doc.id, slot, updater)
                }
                previousUploads={(currentLog?.Document_Uploads ?? []).filter(
                  (u) =>
                    u.Document_Type === doc.name &&
                    u.Submitted_For === applicantName,
                )}
                fileTypes={doc.fileTypes ?? []}
                sectionApprovals={sectionApprovalsMap[doc.name] ?? {}}
                adminUploads={(currentLog?.Admin_Uploads ?? []).filter(
                  (u) => u.Document_Type === doc.name,
                )}
                submissionLogId={currentLog?.id ?? null}
              />
            ))}
          </Box>
        ))}

        {/* Single global submit button — collects files from all applicant tabs */}
        {tab !== instructionsTabIndex && tab !== messagesTabIndex && (
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
            onLogCreated={(id) =>
              setCurrentLog((prev) => prev ?? { id, Document_Uploads: [] })
            }
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
