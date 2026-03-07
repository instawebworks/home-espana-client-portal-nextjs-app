"use client";

import { useState, useRef } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|bmp|svg)$/i;
const PDF_EXTENSION = /\.pdf$/i;

function getPreviewType(filename) {
  if (IMAGE_EXTENSIONS.test(filename)) return "image";
  if (PDF_EXTENSION.test(filename)) return "pdf";
  return null;
}

const STATUS_COLORS = {
  "NOT SUBMITTED": "#9ca3af",
  PENDING: "#f59e0b",
  APPROVED: "#16a34a",
  REJECTED: "#dc2626",
};

export default function DocumentItem({
  name,
  status = "NOT SUBMITTED",
  additionalInstructions,
  expanded = false,
  onChange,
  files = [],
  onFilesChange,
  previousUploads = [],
  submissionLogId,
}) {
  const [dragging, setDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState(null); // { name, url }
  const inputRef = useRef(null);

  function handleUploadClick(upload) {
    const url = `/api/attachment?submissionLogId=${submissionLogId}&attachmentId=${upload.Attachment_ID}`;
    setPreviewFile({ name: upload.Document_Name, url });
  }

  function addFiles(newFiles) {
    const fileArray = Array.from(newFiles);
    onFilesChange((prev) => [...prev, ...fileArray]);
  }

  function removeFile(index) {
    onFilesChange((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  return (
    <Accordion
      disableGutters
      elevation={0}
      expanded={expanded}
      onChange={onChange}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "8px !important",
        mb: 1.5,
        "&:before": { display: "none" },
        overflow: "hidden",
      }}
    >
      <AccordionSummary sx={{ px: 3, py: 1.5, minHeight: "unset" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography fontWeight={700}>{name}</Typography>
          <Typography
            fontWeight={700}
            sx={{
              color: STATUS_COLORS[status] ?? STATUS_COLORS["NOT SUBMITTED"],
              fontSize: "0.8rem",
              letterSpacing: 0.5,
            }}
          >
            {status}
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
        {/* What to upload */}
        {additionalInstructions && (
          <Box
            sx={{
              bgcolor: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: 1,
              p: 2,
              mb: 2.5,
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                color: "#2563eb",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              What to Upload
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: "#1e40af" }}>
              {additionalInstructions}
            </Typography>
          </Box>
        )}

        {/* Previously uploaded files (from CRM) */}
        {previousUploads.length > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Previously Uploaded Files
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {previousUploads.map((upload) => (
                <Box
                  key={upload.Attachment_ID}
                  onClick={() => handleUploadClick(upload)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    bgcolor: "white",
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "#f8faff",
                    },
                  }}
                >
                  <InsertDriveFileOutlinedIcon
                    sx={{
                      fontSize: 18,
                      color: "text.secondary",
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}
                  >
                    {upload.Document_Name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "primary.main", flexShrink: 0 }}
                  >
                    View
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Uploaded files (staged for new submission) */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Uploaded Files
        </Typography>

        {files.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
            {files.map((file, i) => {
              const isImage = file.type.startsWith("image/");
              const url = isImage ? URL.createObjectURL(file) : null;
              return (
                <Box
                  key={i}
                  sx={{
                    position: "relative",
                    width: 80,
                    height: 80,
                    flexShrink: 0,
                  }}
                >
                  {isImage ? (
                    <Box
                      component="img"
                      src={url}
                      alt={file.name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        display: "block",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        bgcolor: "#f8faff",
                        overflow: "hidden",
                        px: 0.5,
                      }}
                    >
                      <InsertDriveFileOutlinedIcon
                        sx={{ color: "text.secondary", fontSize: 28, mb: 0.5 }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.6rem",
                          textAlign: "center",
                          width: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {file.name}
                      </Typography>
                    </Box>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => removeFile(i)}
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      width: 20,
                      height: 20,
                      bgcolor: "white",
                      border: "1px solid",
                      borderColor: "divider",
                      "&:hover": { bgcolor: "#fee2e2", borderColor: "#fca5a5" },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 12 }} />
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Drop zone */}
        <Box
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          sx={{
            border: "2px dashed",
            borderColor: dragging ? "primary.main" : "divider",
            bgcolor: dragging ? "#f0f5ff" : "transparent",
            borderRadius: 1,
            py: 3,
            textAlign: "center",
            cursor: "pointer",
            mt: 1,
            transition: "border-color 0.15s, background-color 0.15s",
            "&:hover": { borderColor: "primary.main", bgcolor: "#f8faff" },
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Drag &amp; drop files here or <strong>Click to browse</strong>
          </Typography>
        </Box>

        <input
          ref={inputRef}
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </AccordionDetails>

      {/* File preview dialog */}
      <Dialog
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: {
            sx:
              getPreviewType(previewFile?.name) !== null
                ? { height: "90vh" }
                : {},
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 1.5,
            fontWeight: 700,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {previewFile?.name}
          <IconButton size="small" onClick={() => setPreviewFile(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, overflow: "hidden", display: "flex" }}>
          {previewFile && getPreviewType(previewFile.name) === "image" && (
            <Box
              component="img"
              src={previewFile.url}
              alt={previewFile.name}
              sx={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          )}
          {previewFile && getPreviewType(previewFile.name) === "pdf" && (
            <Box
              component="iframe"
              src={previewFile.url}
              title={previewFile.name}
              sx={{ width: "100%", height: "100%", border: "none" }}
            />
          )}
          {previewFile && getPreviewType(previewFile.name) === null && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                color: "text.secondary",
                p: 4,
              }}
            >
              <InsertDriveFileOutlinedIcon sx={{ fontSize: 48 }} />
              <Typography variant="body1" fontWeight={600}>
                Preview not available
              </Typography>
              <Typography variant="body2" textAlign="center">
                Only image and PDF files can be previewed.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Accordion>
  );
}
