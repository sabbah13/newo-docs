import React from 'react';

/**
 * Responsive Kodemo embed.
 * Prefer using a published Kodemo document URL via `embedUrl`.
 * Example: embedUrl="https://app.kodemo.com/embed/<publication-id>"
 */
export default function KodemoEmbed({ embedUrl, aspectWidth = 2560, aspectHeight = 1308, height = 0 }) {
  if (!embedUrl) return null;
  const style = {
    boxSizing: 'content-box',
    position: 'relative',
    maxWidth: '100%',
    aspectRatio: `${aspectWidth} / ${aspectHeight}`,
    paddingBottom: height ? 0 : '40px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: '0px 0px 1px rgba(45, 55, 72, 0.05), 0px 4px 8px rgba(45, 55, 72, 0.1)',
    overflow: 'hidden',
  };

  const iframeStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 0,
  };

  return (
    <div style={style}>
      <iframe
        src={embedUrl}
        frameBorder="0"
        scrolling="no"
        style={iframeStyle}
        title="Kodemo Embed"
        allow="clipboard-write; clipboard-read; fullscreen"
      />
    </div>
  );
}


