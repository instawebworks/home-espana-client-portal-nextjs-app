"use client";

import { Box, Typography } from "@mui/material";

export default function PortalPage({ templateId, module, recordId }) {
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
      <Box sx={{ maxWidth: 800, mx: "auto", px: 2, py: 4 }}>
        {/* TODO: Welcome section */}
        {/* TODO: Document checklist */}
      </Box>
    </Box>
  );
}
