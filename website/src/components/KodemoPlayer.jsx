import React from 'react';
import { KodemoPlayer as PlayerComponent } from '@kodemo/player';

/**
 * Kodemo JSON Player component.
 * Provide either `src` (URL) or `document` (JSON object) for inline stories.
 */
export default function KodemoPlayer({ src, document, style }) {
  if (!src && !document) return null;
  const containerStyle = {
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0px 0px 1px rgba(45, 55, 72, 0.05), 0px 4px 8px rgba(45, 55, 72, 0.1)',
    ...style,
  };
  return (
    <div style={containerStyle}>
      {src ? <PlayerComponent src={src} /> : <PlayerComponent document={document} />}
    </div>
  );
}


