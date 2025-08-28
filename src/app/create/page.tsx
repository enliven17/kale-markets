"use client";
import React, { useState } from 'react';
import { creativeSeedMarkets } from '@/constants/seedMarkets';
import { publishMarketToTestnet } from '@/api/stellarPublish';

export default function CreateMarketPage() {
  const [message, setMessage] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  const publishSeeds = async () => {
    if (busy) return;
    setBusy(true);
    setMessage('Publishing 16 seed markets to Stellar Testnet...');
    try {
      for (const m of creativeSeedMarkets) {
        await publishMarketToTestnet({ title: m.title, description: m.description, closesAt: m.closesAt });
      }
      setMessage('All seed markets published to Testnet.');
    } catch (e: any) {
      setMessage(`Error: ${e?.message || 'Failed to publish seeds'}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{padding:16}}>
      <h2>Seed Markets (Stellar Testnet)</h2>
      <p>Create and publish 16 creative KALE markets to Stellar Testnet as data entries.</p>
      <button onClick={publishSeeds} disabled={busy}>
        {busy ? 'Publishing…' : 'Publish 16 KALE Seeds'}
      </button>
      {message && <p style={{marginTop:12}}>{message}</p>}
    </div>
  );
}