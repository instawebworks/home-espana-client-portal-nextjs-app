"use client";

import { Box, Button, Divider, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export default function AdminUploadsCard({ adminUploads, submissionLogId, nested = false }) {
  if (!adminUploads || adminUploads.length === 0) return null;

  function attachmentUrl(upload, download = false) {
    const params = new URLSearchParams({
      submissionLogId,
      attachmentId: upload.Attachment_ID,
    });
    if (download) {
      params.set("download", "true");
      params.set("filename", upload.Document_Name);
    }
    return `/api/attachment?${params}`;
  }

  return (
    <Box
      sx={nested ? {
        mx: 2,
        mt: 1.5,
        mb: 0,
        border: "1px solid #fde68a",
        borderRadius: "8px",
        overflow: "hidden",
      } : {
        border: "1px solid #fde68a",
        borderRadius: "8px",
        overflow: "hidden",
        mb: 0.75,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "#fef9c3",
          px: 2,
          py: 1.25,
          borderBottom: "1px solid #fde68a",
        }}
      >
        <InsertDriveFileOutlinedIcon sx={{ fontSize: 16, color: "#92400e", flexShrink: 0 }} />
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{ color: "#92400e", textTransform: "uppercase", letterSpacing: 0.5, flex: 1 }}
        >
          Admin Reference Documents
        </Typography>
        <Typography variant="caption" sx={{ color: "#a16207", fontWeight: 500 }}>
          {adminUploads.length} file{adminUploads.length !== 1 ? "s" : ""}
        </Typography>
      </Box>

      {/* File rows */}
      <Box sx={{ bgcolor: "white" }}>
        {adminUploads.map((upload, idx) => (
          <Box key={upload.Attachment_ID ?? idx}>
            {idx > 0 && <Divider />}

            {/* Comment row */}
            {upload.Additional_Comment && (
              <Box sx={{ px: 2, pt: 1.25, pb: 0 }}>
                <Typography
                  variant="body2"
                  sx={{ color: "#78350f", fontStyle: "italic" }}
                >
                  "{upload.Additional_Comment}"
                </Typography>
              </Box>
            )}

            {/* File + actions row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1,
              }}
            >
              <InsertDriveFileOutlinedIcon sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }} />
              <Typography
                variant="body2"
                sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {upload.Document_Name}
              </Typography>
              <Box sx={{ display: "flex", gap: 0.75, flexShrink: 0 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<OpenInNewIcon sx={{ fontSize: "13px !important" }} />}
                  href={attachmentUrl(upload)}
                  target="_blank"
                  rel="noopener noreferrer"
                  component="a"
                  sx={{ fontSize: "0.7rem", py: 0.4, px: 1, minWidth: 0, borderColor: "#fcd34d", color: "#92400e", "&:hover": { bgcolor: "#fef3c7", borderColor: "#f59e0b" } }}
                >
                  View
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadIcon sx={{ fontSize: "13px !important" }} />}
                  href={attachmentUrl(upload, true)}
                  download={upload.Document_Name}
                  component="a"
                  sx={{ fontSize: "0.7rem", py: 0.4, px: 1, minWidth: 0, color: "text.secondary", borderColor: "divider" }}
                >
                  Save
                </Button>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
