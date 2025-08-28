const { Keypair } = require('@stellar/stellar-sdk');

const kp = Keypair.random();
console.log('Public Key:', kp.publicKey());
console.log('Secret Key:', kp.secret());
console.log('\nFund this public key on Stellar TESTNET, then run the seed publish script.');


