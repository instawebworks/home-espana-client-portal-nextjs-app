"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const SPECIAL_CHARS = "!@#$%&*";

function getValidations(password) {
  return {
    length: password.length >= 12,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: [...SPECIAL_CHARS].some((c) => password.includes(c)),
  };
}

const CRITERIA = [
  { key: "length", label: "12+ characters" },
  { key: "upper", label: "Uppercase letter" },
  { key: "lower", label: "Lowercase letter" },
  { key: "number", label: "Number" },
  { key: "special", label: `Special character (${SPECIAL_CHARS})` },
];

export default function ChangePasswordForm({ templateId, module, recordId, currentPassword }) {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState(currentPassword);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const validations = getValidations(newPassword);
  const allValid = Object.values(validations).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== "";
  const sameAsOld = newPassword.length > 0 && newPassword === oldPassword;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!allValid || !passwordsMatch || sameAsOld) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword, templateId, module, recordId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to change password. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push(`/${templateId}/${module}/${recordId}/login`);
    } catch {
      setError("Something went wrong. Please try again.");
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
        }}
      >
        <Typography variant="h4" fontWeight={700} color="text.primary">
          Hipoteken Document Portal
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Change Password
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 480, mx: "auto", px: 2, py: 4 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
            Change Password
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Current password */}
            <TextField
              label="Current Password"
              type={showOld ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              fullWidth
              required
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowOld((v) => !v)} edge="end">
                      {showOld ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* New password */}
            <TextField
              label="New Password"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              required
              sx={{ mb: 1 }}
              error={sameAsOld}
              helperText={sameAsOld ? "New password must be different from the current password" : ""}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNew((v) => !v)} edge="end">
                      {showNew ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Validation checklist */}
            {newPassword.length > 0 && (
              <List dense disablePadding sx={{ mb: 2, pl: 1 }}>
                {CRITERIA.map(({ key, label }) => {
                  const met = validations[key];
                  return (
                    <ListItem key={key} disableGutters sx={{ py: 0.25 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        {met ? (
                          <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
                        ) : (
                          <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={label}
                        primaryTypographyProps={{
                          variant: "caption",
                          color: met ? "success.main" : "text.secondary",
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}

            {/* Confirm password */}
            <TextField
              label="Confirm New Password"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
              sx={{ mb: 3 }}
              error={confirmPassword.length > 0 && !passwordsMatch}
              helperText={confirmPassword.length > 0 && !passwordsMatch ? "Passwords do not match" : ""}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end">
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => router.push(`/${templateId}/${module}/${recordId}`)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={!allValid || !passwordsMatch || sameAsOld || submitting}
              >
                {submitting ? <CircularProgress size={22} color="inherit" /> : "Update Password"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
