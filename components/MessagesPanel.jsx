"use client";

import { useState, useEffect, useRef } from "react";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

function formatTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const timeStr = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  if (isToday) return `Today at ${timeStr}`;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + ` at ${timeStr}`;
}

export default function MessagesPanel({ submissionLogId: initialLogId, templateId, module, recordId, clientName, initialNotes = [], onLogCreated }) {
  const [notes, setNotes] = useState(initialNotes);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [logId, setLogId] = useState(initialLogId ?? null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (initialLogId && initialLogId !== logId) setLogId(initialLogId);
  }, [initialLogId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes]);

  async function handleSend() {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      let currentLogId = logId;
      if (!currentLogId) {
        const res = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateId, module, recordId, submissionLogId: null }),
        });
        const data = await res.json();
        if (!res.ok) return;
        currentLogId = data.submissionLogId;
        setLogId(currentLogId);
        onLogCreated?.(currentLogId);
      }

      const res = await fetch("/api/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionLogId: currentLogId, content }),
      });
      if (!res.ok) return;

      setText("");
      setNotes((prev) => [
        ...prev,
        {
          id: `optimistic-${Date.now()}`,
          Note_Title: "Client Note",
          Note_Content: content,
          Created_Time: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: 500,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "white",
      }}
    >
      {/* Messages area */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 2.5,
          py: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {notes.length === 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              No messages yet. Ask a question or send us a note below.
            </Typography>
          </Box>
        )}


        {notes.map((note) => {
          const isClient = note.Note_Title === "Client Note";
          const senderName = isClient ? (clientName ?? "You") : "Admin";
          const timestamp = note.Created_Time;

          return (
            <Box
              key={note.id}
              sx={{ display: "flex", flexDirection: "column", alignItems: isClient ? "flex-end" : "flex-start" }}
            >
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{ mb: 0.5, color: "text.secondary", px: 0.5 }}
              >
                {senderName}
              </Typography>
              <Box
                sx={{
                  maxWidth: "75%",
                  px: 2,
                  py: 1.25,
                  borderRadius: isClient ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  bgcolor: isClient ? "primary.main" : "#f3f4f6",
                  color: isClient ? "white" : "text.primary",
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {note.Note_Content}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{ mt: 0.5, color: "text.secondary", px: 0.5, fontSize: "0.7rem" }}
              >
                {formatTime(timestamp)}
              </Typography>
            </Box>
          );
        })}

        <div ref={bottomRef} />
      </Box>

      {/* Compose area */}
      <Box sx={{ borderTop: "1px solid", borderColor: "divider", px: 2, py: 1.5, display: "flex", alignItems: "flex-end", gap: 1, bgcolor: "white" }}>
        <TextField
          multiline
          maxRows={4}
          fullWidth
          size="small"
          placeholder="Write a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
        />
        <IconButton
          onClick={handleSend}
          disabled={!text.trim() || sending}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            flexShrink: 0,
            "&:hover": { bgcolor: "primary.dark" },
            "&.Mui-disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" },
          }}
        >
          <SendIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
