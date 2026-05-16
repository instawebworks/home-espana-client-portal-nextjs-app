"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

const MAX_APPLICANTS = 5;

export default function ApplicantsForm({ templateId, module, recordId, submissionLogId }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [count, setCount] = useState(null);
  const [names, setNames] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleCountSelect(n) {
    setCount(n);
    setNames(Array(n).fill(""));
    setStep(2);
  }

  function handleNameChange(i, value) {
    setNames((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = names.map((n) => n.trim());
    if (trimmed.some((n) => !n)) {
      setError("Please fill in all applicant names.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, module, recordId, submissionLogId, names: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push(`/${templateId}/${module}/${recordId}?lid=${data.submissionLogId}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(145deg, #1d3c78 0%, #2d6bc4 100%)",
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 480,
          p: { xs: 3, sm: 5 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Image
          src="/image.png"
          alt="Hipoteken"
          width={160}
          height={100}
          style={{ objectFit: "contain" }}
          priority
        />

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h5" fontWeight={700} color="primary">
            Hipoteken Document Portal
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Before we begin, tell us about the applicants
          </Typography>
        </Box>

        {/* Step 1 — count selector */}
        {step === 1 && (
          <Box sx={{ width: "100%", mt: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <GroupsIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={700}>
                How many applicants?
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              How many people are submitting documents for this application?
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              {Array.from({ length: MAX_APPLICANTS }, (_, i) => i + 1).map((n) => (
                <Button
                  key={n}
                  variant="outlined"
                  size="large"
                  onClick={() => handleCountSelect(n)}
                  sx={{
                    flex: "1 1 64px",
                    minWidth: 64,
                    py: 2,
                    fontWeight: 700,
                    fontSize: "1.15rem",
                  }}
                >
                  {n}
                </Button>
              ))}
            </Box>
          </Box>
        )}

        {/* Step 2 — name inputs */}
        {step === 2 && (
          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", mt: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <PersonOutlineIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={700}>
                Applicant {count === 1 ? "Name" : "Names"}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Please enter the full name of{" "}
              {count === 1 ? "the applicant" : `each of the ${count} applicants`}.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {names.map((name, i) => (
                <TextField
                  key={i}
                  label={`Applicant ${i + 1} — Full Name`}
                  value={name}
                  onChange={(e) => handleNameChange(i, e.target.value)}
                  required
                  fullWidth
                  autoFocus={i === 0}
                />
              ))}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => setStep(1)}
                disabled={submitting}
                sx={{ minWidth: 90 }}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={submitting}
                sx={{ py: 1.5, fontWeight: 600 }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : "Continue to Portal"}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
