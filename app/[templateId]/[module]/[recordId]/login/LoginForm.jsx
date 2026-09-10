"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useT } from "@/components/I18nProvider";

export default function LoginForm({ templateId, module, recordId }) {
  const router = useRouter();
  const t = useT();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, templateId, module, recordId }),
      });

      const data = await res.json();

      if (!res.ok) {
        // The API returns a stable `code`; the wording comes from the
        // dictionary so it is shown in the client's language.
        setError(t.errors[data.code] ?? t.common.genericError);
        setLoading(false);
        return;
      }

      router.push(`/${templateId}/${module}/${recordId}`);
    } catch {
      setError(t.common.networkError);
      setLoading(false);
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
          maxWidth: 440,
          p: { xs: 3, sm: 5 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Logo */}
        <Image
          src="/image.png"
          alt="Home Espana"
          width={160}
          height={100}
          style={{ objectFit: "contain" }}
          priority
        />

        {/* Heading */}
        <Box sx={{ textAlign: "center", mt: 1 }}>
          <Typography variant="h5" fontWeight={700} color="primary">
            {t.brand.portalName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t.login.subtitle}
          </Typography>
        </Box>

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: "100%",
            mt: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label={t.login.password}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value.trim())}
            required
            fullWidth
            autoFocus
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    aria-label={t.login.togglePassword}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={loading}
            sx={{ mt: 1, py: 1.5, fontWeight: 600 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t.login.submit
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
