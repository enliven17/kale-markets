#!/usr/bin/env ts-node
import { Server, Keypair, TransactionBuilder, BASE_FEE, Operation } from 'stellar-sdk';
import { creativeSeedMarkets } from '@/constants/seedMarkets';
import { STELLAR_NETWORK_PASSPHRASE } from '@/config/stellar';
import fs from 'fs';
import path from 'path';

async function main() {
  const secret = process.env.STELLAR_SEED_SECRET;
  if (!secret) throw new Error('Missing STELLAR_SEED_SECRET');
  const keypair = Keypair.fromSecret(secret);
  const server = new Server('https://horizon-testnet.stellar.org');
  const passphrase = STELLAR_NETWORK_PASSPHRASE.TESTNET;
  const account = await server.loadAccount(keypair.publicKey());

  const results: { id: string; tx: string }[] = [];
  for (const m of creativeSeedMarkets) {
    const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: passphrase })
      .addOperation(Operation.manageData({ name: `market:${m.id}`, value: new TextEncoder().encode(JSON.stringify({ title: m.title, d: m.description, c: m.closesAt })) }))
      .setTimeout(180)
      .build();
    tx.sign(keypair);
    const res = await server.submitTransaction(tx);
    results.push({ id: m.id, tx: res.hash });
  }

  const out = path.join(process.cwd(), 'src/constants/seedTxs.json');
  fs.writeFileSync(out, JSON.stringify(results, null, 2));
  console.log('Published. TX hashes saved to', out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});





