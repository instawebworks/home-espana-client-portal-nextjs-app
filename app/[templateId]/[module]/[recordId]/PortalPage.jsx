"use client";

import { Box, Paper, Typography } from "@mui/material";

export default function PortalPage({ templateJson, crmRecord, submissionLog }) {
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
          {/* <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Application: Johnson&apos;s Mortgage Application &nbsp;|&nbsp; Visa
            Type: <strong>Work Visa</strong>
          </Typography> */}
        </Paper>

        {/* TODO: Document checklist */}
      </Box>
    </Box>
  );
}
