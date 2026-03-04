"use client";

import { useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import DocumentItem from "@/components/DocumentItem";

export default function PortalPage({ templateJson, crmRecord, submissionLog }) {
  const documentRequirements = (templateJson?.documentRequirements ?? []).filter((doc) => doc.checked);
  const [expandedId, setExpandedId] = useState(null);
  const [filesByDoc, setFilesByDoc] = useState({});

  function handleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function handleFilesChange(docId, updater) {
    setFilesByDoc((prev) => ({ ...prev, [docId]: updater(prev[docId] ?? []) }));
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
            status="NOT SUBMITTED"
            additionalInstructions={doc.additionalInstructions}
            expanded={expandedId === doc.id}
            onChange={() => handleExpand(doc.id)}
            files={filesByDoc[doc.id] ?? []}
            onFilesChange={(updater) => handleFilesChange(doc.id, updater)}
          />
        ))}
      </Box>
    </Box>
  );
}
