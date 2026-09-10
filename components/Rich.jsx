import { Fragment } from "react";

/**
 * Renders `**bold**` segments of a dictionary string as <strong>.
 *
 * Keeps translations as plain strings — a translator can move the emphasis to
 * wherever it falls naturally in their language instead of being pinned to the
 * word order of the English JSX.
 */
export default function Rich({ text }) {
  // Capturing group => odd indices are the emphasised segments.
  const parts = String(text ?? "").split(/\*\*(.+?)\*\*/);

  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i}>{part}</strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
