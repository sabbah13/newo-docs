import React, { useEffect, useMemo, useState } from 'react';
import Layout from '@theme/Layout';
import { KodemoPlayer as Player } from '@kodemo/player';

export default function KodemoPage() {
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState(null);

  const [catalog, setCatalog] = useState([]);
  const [selected, setSelected] = useState('conversation-started');

  useEffect(() => {
    fetch('/kodemo/index.json')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load Kodemo index: ${res.status}`);
        return res.json();
      })
      .then((list) => {
        setCatalog(list);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    const path = `/kodemo/${selected}.json`;
    setDoc(null);
    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load Kodemo doc: ${res.status}`);
        return res.json();
      })
      .then(setDoc)
      .catch((e) => setError(e.message));
  }, [selected]);

  return (
    <Layout title="Kodemo">
      <div style={{ height: 'calc(100vh - 140px)', padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label htmlFor="kodemo-select" style={{ marginRight: 8, fontWeight: 600 }}>Walkthrough:</label>
          <select id="kodemo-select" value={selected} onChange={(e) => setSelected(e.target.value)}>
            {catalog.map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>
        </div>
        {!doc && !error && <div style={{ padding: 16 }}>Loading Kodemo…</div>}
        {error && <div style={{ padding: 16, color: 'red' }}>{error}</div>}
        {doc && (
          <Player
            json={doc}
            layout="auto"
            keyboardPagination
            copyCode
            theme={{
              colors: { brand: '#2f6feb' },
              code: {
                // Use codemirror-ish defaults; Kodemo uses Prism-style themes internally
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace',
                fontSize: 13,
                lineHeight: 1.6,
              },
            }}
          />
        )}
      </div>
    </Layout>
  );
}


