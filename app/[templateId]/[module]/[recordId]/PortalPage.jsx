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
// Temporarily unused — only Option 2 (hidden at the client's request) uses this.
// import EditNoteIcon from "@mui/icons-material/EditNote";
import DocumentItem from "@/components/DocumentItem";
import MessagesPanel from "@/components/MessagesPanel";
import { useT } from "@/components/I18nProvider";
import Rich from "@/components/Rich";

function getFirstName(fullName) {
  return fullName.split(" ")[0];
}

function formatUploadDate(value, intl) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(intl, {
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
  sectionApproved,
) {
  if (sectionApproved) return "APPROVED";

  const rows = (documentUploads ?? []).filter(
    (r) => r.Document_Type === docName && r.Submitted_For === applicantName,
  );
  if (rows.length === 0) return "NOT SUBMITTED";

  if (rows.some((r) => r.Approval_Status === "Pending")) return "PENDING";
  if (rows.every((r) => r.Approval_Status === "Rejected")) return "REJECTED";
  return "PENDING";
}

// Section_Approvals schema (written by the CRM widget):
//   { "<Applicant Name>": { "<Section name>": true } }
// A section shows APPROVED only when the broker has signed it off for that
// applicant. Legacy entries ({ "<Section>": { section/front/back: true } })
// predate the per-applicant model and are read as approved for every applicant.
function normalizeSectionApprovals(raw, applicants) {
  let parsed = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {};
    }
  }
  if (!parsed || typeof parsed !== "object") return {};

  const names = applicants.map((n) => n.trim());
  const nameSet = new Set(names);
  const out = {};
  const approve = (name, section) => {
    out[name] = { ...(out[name] ?? {}), [section]: true };
  };

  Object.entries(parsed).forEach(([key, val]) => {
    if (!val || typeof val !== "object") return;
    if (nameSet.has(key.trim())) {
      Object.entries(val).forEach(([section, v]) => {
        if (v === true) approve(key.trim(), section);
      });
    } else {
      const done = val.section === true || (val.front === true && val.back === true);
      if (done) names.forEach((name) => approve(name, key));
    }
  });
  return out;
}

// A requirement with a non-empty `forApplicants` list is scoped to those applicants
// (broker-requested extra docs); otherwise it's universal and shown to everyone.
function isReqForApplicant(doc, applicantName) {
  const list = Array.isArray(doc?.forApplicants)
    ? doc.forApplicants.map((s) => (s ?? "").trim()).filter(Boolean)
    : [];
  if (list.length === 0) return true;
  return list.includes((applicantName ?? "").trim());
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
  const applicationFormTabIndex = 1;
  const messagesTabIndex = applicants.length + 2;

  const clientName =
    crmRecord?.Full_Name ||
    crmRecord?.Contact_Name?.name ||
    crmRecord?.Deal_Name ||
    "You";

  const greetingName =
    clientName && clientName !== "You" ? getFirstName(clientName) : null;

  // Zoho webform (Option 2). The Deal ID is passed as `id` so the submission
  // can be linked back to this record.
  // Hidden at the client's request — restore together with the Option 2 block below.
  // const webformUrl = `https://forms.zohopublic.eu/Hipoteken/form/Requiredinformation1/formperma/pjyGLWLvEkK4-n98pKWe1yjfMS3evvivEKhIyJ9IaPg?id=${encodeURIComponent(
  //   recordId,
  // )}`;

  const router = useRouter();
  const t = useT();
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

  // { "<Applicant Name>": { "<Section name>": true } } — see normalizeSectionApprovals.
  const sectionApprovalsByApplicant = normalizeSectionApprovals(
    currentLog?.Section_Approvals,
    applicants,
  );
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
        message: t.applicationForm.uploadOk,
        severity: "success",
      });
      // Re-fetch server data so the newly uploaded form shows in the list.
      router.refresh();
    } catch {
      setSnackbar({
        open: true,
        message: t.applicationForm.uploadFail,
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
      setSubmitError(t.portal.submit.noFiles);
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
          message: t.portal.submit.failed,
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
          message: t.portal.submit.uploadFailed,
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
        message: t.portal.submit.ok,
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
          px: 2,
          textAlign: "center",
          position: "relative",
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          color="text.primary"
          sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
        >
          {t.brand.portalName}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {t.portal.tagline}
        </Typography>
        <Button
          size="small"
          startIcon={<LockResetIcon />}
          onClick={() =>
            router.push(`/${templateId}/${module}/${recordId}/change-password`)
          }
          variant="outlined"
          sx={{
            mt: { xs: 1.5, sm: 0 },
            position: { xs: "static", sm: "absolute" },
            top: { sm: "50%" },
            right: { sm: 16 },
            transform: { sm: "translateY(-50%)" },
          }}
        >
          {t.portal.changePassword}
        </Button>
      </Box>

      {/* Page body */}
      <Box sx={{ maxWidth: 800, mx: "auto", px: 2, py: 2 }}>
        {/* Welcome */}
        <Paper variant="outlined" sx={{ px: 3, py: 2, mb: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t.portal.welcome(clientName)}
          </Typography>
        </Paper>

        {/* Dynamic tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2.5 }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            // Translated tab labels run much longer than the English ones
            // (Spanish needs ~920px of the ~768px available at default sizing),
            // which pushed the strip into scroll mode and cost another 80px to
            // the scroll arrows. Sentence case instead of MUI's default
            // uppercase, plus tighter padding, buys back enough width for the
            // usual one- or two-applicant case in all four languages.
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                fontWeight: 600,
                minWidth: "auto",
                px: { xs: 1.25, sm: 1.5 },
              },
            }}
          >
            <Tab label={t.portal.tabs.instructions} />
            <Tab label={t.portal.tabs.applicationForm} />
            {applicants.map((name) => (
              <Tab
                key={name}
                label={t.portal.tabs.applicant(getFirstName(name))}
              />
            ))}
            <Tab label={t.portal.tabs.messages} />
          </Tabs>
        </Box>

        {/* Application Form tab */}
        <Box sx={{ display: tab === applicationFormTabIndex ? "block" : "none" }}>
          {/* ── Part 1: Required information intro ── */}
          <Paper variant="outlined" sx={{ px: 3, py: 2.5, mb: 2 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {greetingName
                ? t.applicationForm.greeting(greetingName)
                : t.applicationForm.greetingNoName}
            </Typography>
            {/* Single-option copy while Option 2 (webform) is hidden — see the
                commented-out Part 3 block below. */}
            <Typography variant="body2" color="text.secondary">
              <Rich text={t.applicationForm.intro} />
            </Typography>

            {/* ── Two-option intro — restore alongside the Option 2 block ──

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

            ── end two-option intro ── */}
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
                {t.applicationForm.option1Title}
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
                    {t.applicationForm.step1Title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5 }}
                  >
                    {t.applicationForm.step1Body}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    component="a"
                    href="/credit-application-form.pdf"
                    download={t.applicationForm.downloadFileName}
                  >
                    {t.applicationForm.step1Button}
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
                    {t.applicationForm.step2Title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5 }}
                  >
                    {t.applicationForm.step2Body}
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
                        {t.applicationForm.received(requiredInfoUploads.length)}
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
                              {formatUploadDate(f.time, t.intl)}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Once a form has been received, hide the upload control —
                      the client may only submit the required-info form once. */}
                  {requiredInfoUploads.length === 0 && (
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
                        {t.applicationForm.chooseFile(Boolean(reuploadFile))}
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
                            {reuploading
                              ? t.applicationForm.uploading
                              : t.applicationForm.uploadButton}
                          </Button>
                        </>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* ── Part 3: Online webform ──
              HIDDEN at the client's request (temporary). To restore, uncomment
              this block along with the `webformUrl` const and the EditNoteIcon
              import above, and put option 2 back in the Part 1 intro copy.

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
                Prefer not to download anything? Just fill in the form below and
                submit it — your details come straight through to us, no upload
                needed.
              </Typography>
              <Box
                component="iframe"
                title="Required information form"
                src={webformUrl}
                sx={{
                  width: "100%",
                  height: { xs: 640, sm: 720 },
                  border: "none",
                  display: "block",
                }}
              />
            </Box>
          </Paper>

          ── end hidden Option 2 ── */}

        </Box>

        {/* Instructions tab */}
        <Box sx={{ display: tab === instructionsTabIndex ? "block" : "none" }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ display: "block", mb: 1 }}
          >
            {t.instructions.overline}
          </Typography>

          <Paper variant="outlined" sx={{ px: 3, py: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {t.instructions.nav.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Rich text={t.instructions.nav.body} />
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ px: 3, py: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {t.instructions.status.title}
            </Typography>
            <Box
              component="ul"
              sx={{ pl: 2.5, m: 0, color: "text.secondary" }}
            >
              {["notSubmitted", "pending", "approved", "rejected"].map((key) => (
                <li key={key}>
                  <Typography variant="body2" component="span">
                    <Rich text={t.instructions.status[key]} />
                  </Typography>
                </li>
              ))}
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ px: 3, py: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {t.instructions.uploading.title}
            </Typography>
            <Box
              component="ol"
              sx={{ pl: 2.5, m: 0, color: "text.secondary" }}
            >
              {["step1", "step2", "step3", "step4"].map((key) => (
                <li key={key}>
                  <Typography variant="body2" component="span">
                    <Rich text={t.instructions.uploading[key]} />
                  </Typography>
                </li>
              ))}
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1.5 }}
            >
              {t.instructions.uploading.note}
            </Typography>
          </Paper>

          {/* Remaining panels are all plain title + body. */}
          {["reference", "messages", "security"].map((key) => (
            <Paper key={key} variant="outlined" sx={{ px: 3, py: 2.5, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                {t.instructions[key].title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <Rich text={t.instructions[key].body} />
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* Applicant document tabs */}
        {applicants.map((applicantName, applicantIdx) => (
          <Box
            key={applicantName}
            sx={{ display: tab === applicantIdx + 2 ? "block" : "none" }}
          >
            {documentRequirements
              .filter((doc) => isReqForApplicant(doc, applicantName))
              .map((doc) => (
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
                  sectionApprovalsByApplicant[applicantName]?.[doc.name] === true,
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
                sectionApproved={
                  sectionApprovalsByApplicant[applicantName]?.[doc.name] === true
                }
                adminUploads={(currentLog?.Admin_Uploads ?? []).filter(
                  (u) =>
                    u.Document_Type === doc.name &&
                    u.Uploaded_For === applicantName,
                )}
                submissionLogId={currentLog?.id ?? null}
              />
            ))}
          </Box>
        ))}

        {/* Single global submit button — collects files from all applicant tabs */}
        {tab !== instructionsTabIndex &&
          tab !== applicationFormTabIndex &&
          tab !== messagesTabIndex && (
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
              {submitting ? t.portal.submit.busy : t.portal.submit.label}
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
