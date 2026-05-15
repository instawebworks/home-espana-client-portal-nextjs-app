"use client";

import { useState, useRef } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

const STATUS_COLORS = {
  "NOT SUBMITTED": "#9ca3af",
  PENDING: "#f59e0b",
  APPROVED: "#16a34a",
  REJECTED: "#dc2626",
};

const APPROVAL_COLORS = {
  Pending: "#f59e0b",
  Approved: "#16a34a",
  Rejected: "#dc2626",
};

function UploadZone({
  files,
  onFilesChange,
  allowedExts,
  acceptStr,
  fileTypes,
  previousUploads,
  approved,
}) {
  const [dragging, setDragging] = useState(false);
  const [fileWarning, setFileWarning] = useState(null);
  const inputRef = useRef(null);

  function addFiles(newFiles) {
    const fileArray = Array.from(newFiles);
    if (!allowedExts) {
      onFilesChange((prev) => [...prev, ...fileArray]);
      return;
    }
    const accepted = [];
    const rejected = [];
    for (const file of fileArray) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext && allowedExts.has(ext)) accepted.push(file);
      else rejected.push(file.name);
    }
    if (accepted.length > 0) onFilesChange((prev) => [...prev, ...accepted]);
    if (rejected.length > 0)
      setFileWarning(`Only ${fileTypes.join(", ")} files are allowed. Rejected: ${rejected.join(", ")}`);
  }

  function removeFile(index) {
    onFilesChange((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    setFileWarning(null);
    addFiles(e.dataTransfer.files);
  }

  return (
    <>
      {previousUploads.length > 0 && (
        <Box sx={{ mb: approved ? 0 : 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Uploaded Files
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {previousUploads.map((upload) => {
              const isRejected = upload.Approval_Status === "Rejected";
              return (
                <Box key={upload.Attachment_ID}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1.5,
                      py: 1,
                      border: "1px solid",
                      borderColor: isRejected ? "#fca5a5" : "divider",
                      borderRadius: isRejected && upload.Admin_Comment ? "8px 8px 0 0" : 1,
                      bgcolor: isRejected ? "#fff8f8" : "white",
                    }}
                  >
                    <InsertDriveFileOutlinedIcon sx={{ fontSize: 18, color: "text.secondary", flexShrink: 0 }} />
                    <Typography
                      variant="body2"
                      sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}
                    >
                      {upload.Document_Name}
                    </Typography>
                    {upload.Approval_Status && (
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{
                          color: APPROVAL_COLORS[upload.Approval_Status] ?? "#9ca3af",
                          flexShrink: 0,
                          textTransform: "uppercase",
                          fontSize: "0.7rem",
                          letterSpacing: 0.5,
                        }}
                      >
                        {upload.Approval_Status}
                      </Typography>
                    )}
                  </Box>
                  {isRejected && upload.Admin_Comment && (
                    <Box
                      sx={{
                        px: 1.5,
                        py: 1,
                        border: "1px solid #fca5a5",
                        borderTop: "none",
                        borderRadius: "0 0 8px 8px",
                        bgcolor: "#fef2f2",
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{ color: "#dc2626", textTransform: "uppercase", letterSpacing: 0.5 }}
                      >
                        Admin Comment
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.25, color: "#7f1d1d" }}>
                        {upload.Admin_Comment}
                      </Typography>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {!approved && (
        <>
          {previousUploads.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Uploaded Files
            </Typography>
          )}

          {files.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2, mt: previousUploads.length > 0 ? 1.5 : 0 }}>
              {files.map((file, i) => {
                const isImage = file.type.startsWith("image/");
                const url = isImage ? URL.createObjectURL(file) : null;
                return (
                  <Box key={i} sx={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
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
                        <InsertDriveFileOutlinedIcon sx={{ color: "text.secondary", fontSize: 28, mb: 0.5 }} />
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

          <Box
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
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

          {fileWarning && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {fileWarning}
            </Typography>
          )}

          <input
            ref={inputRef}
            type="file"
            multiple
            accept={acceptStr}
            style={{ display: "none" }}
            onChange={(e) => {
              setFileWarning(null);
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </>
      )}
    </>
  );
}

export default function DocumentItem({
  name,
  requirement,
  scanType = "Single",
  status = "NOT SUBMITTED",
  additionalInstructions,
  expanded = false,
  onChange,
  fileSlots = {},
  onSlotChange,
  previousUploads = [],
  fileTypes = [],
}) {
  const allowedExts =
    fileTypes.length > 0 ? new Set(fileTypes.map((t) => t.toLowerCase())) : null;
  const acceptStr = allowedExts
    ? fileTypes.map((t) => `.${t.toLowerCase()}`).join(",")
    : undefined;

  const isFrontBack = scanType === "Front & Back";
  const slots = isFrontBack ? ["Front", "Back"] : ["Single"];

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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography fontWeight={700}>{name}</Typography>
            {requirement && (
              <Box
                component="span"
                sx={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  px: 0.75,
                  py: 0.25,
                  borderRadius: "4px",
                  bgcolor: requirement === "Required" ? "#fef2f2" : "#f3f4f6",
                  color: requirement === "Required" ? "#dc2626" : "#6b7280",
                  border: "1px solid",
                  borderColor: requirement === "Required" ? "#fca5a5" : "#e5e7eb",
                  lineHeight: 1.4,
                }}
              >
                {requirement === "Optional" ? "If Applicable" : requirement}
              </Box>
            )}
          </Box>
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
              sx={{ color: "#2563eb", textTransform: "uppercase", letterSpacing: 1 }}
            >
              What to Upload
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: "#1e40af" }}>
              {additionalInstructions}
            </Typography>
          </Box>
        )}

        {isFrontBack ? (
          slots.map((slot, idx) => {
            const slotUploads = previousUploads.filter((u) => u.Scan_Type === slot);
            const slotApproved = slotUploads.some((u) => u.Approval_Status === "Approved");
            return (
              <Box key={slot}>
                {idx > 0 && <Divider sx={{ my: 2.5 }} />}
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    display: "block",
                    mb: 1.5,
                    color: slotApproved ? "#16a34a" : "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {slot} Side{slotApproved ? " — Approved" : ""}
                </Typography>
                <UploadZone
                  files={fileSlots[slot] ?? []}
                  onFilesChange={(updater) => onSlotChange(slot, updater)}
                  allowedExts={allowedExts}
                  acceptStr={acceptStr}
                  fileTypes={fileTypes}
                  previousUploads={slotUploads}
                  approved={slotApproved}
                />
              </Box>
            );
          })
        ) : (
          <UploadZone
            files={fileSlots["Single"] ?? []}
            onFilesChange={(updater) => onSlotChange("Single", updater)}
            allowedExts={allowedExts}
            acceptStr={acceptStr}
            fileTypes={fileTypes}
            previousUploads={previousUploads}
            approved={previousUploads.some((u) => u.Approval_Status === "Approved")}
          />
        )}
      </AccordionDetails>

    </Accordion>
  );
}
