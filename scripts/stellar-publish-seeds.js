const fs = require('fs');
const path = require('path');
const { Horizon, Keypair, Networks, TransactionBuilder, BASE_FEE, Operation } = require('@stellar/stellar-sdk');
const crypto = require('crypto');
const seeds = require('./seedMarkets.json');

async function loadSeeds() {
  // Fallback dynamic import from TS source transpiled on the fly is complex; instead, require TS module via ts-node/register if present
  try {
    const tsNode = require('ts-node');
    tsNode.register({ transpileOnly: true });
    const { creativeSeedMarkets } = require('../src/constants/seedMarkets.ts');
    return creativeSeedMarkets;
  } catch (e) {
    // As a fallback, read raw JSON-like by requiring compiled helper
    throw new Error('Unable to load seed markets from TS. Please run with ts-node available or convert seeds to JSON.');
  }
}

async function main() {
  const secret = process.env.STELLAR_SEED_SECRET;
  if (!secret) throw new Error('Missing STELLAR_SEED_SECRET');
  const keypair = Keypair.fromSecret(secret);
  const server = new Horizon.Server('https://horizon-testnet.stellar.org');
  const passphrase = Networks.TESTNET;

  const account = await server.loadAccount(keypair.publicKey());

  const results = [];
  for (const m of seeds) {
    const title64 = Buffer.from(m.title).slice(0, 64);
    const descHash = crypto.createHash('sha256').update(String(m.description || '')).digest();
    const closesAtStr = String(m.closesAt || '');
    const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: passphrase })
      .addOperation(Operation.manageData({ name: `market:${m.id}:t`, value: title64 }))
      .addOperation(Operation.manageData({ name: `market:${m.id}:d`, value: descHash }))
      .addOperation(Operation.manageData({ name: `market:${m.id}:c`, value: Buffer.from(closesAtStr) }))
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


