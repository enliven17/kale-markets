import { Asset, Operation, TransactionBuilder, BASE_FEE, Horizon, Memo } from "@stellar/stellar-sdk";
import { getKaleAsset, STELLAR_NETWORK_PASSPHRASE, getKaleIssuer } from "@/config/stellar";
import { getWalletKit } from "@/api/walletKit";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";

type KalePaymentParams = {
  destination: string;
  amount: string; // decimal string
  memoText?: string;
};

export async function submitKalePaymentOnMainnet(params: KalePaymentParams) {
  try {
    console.log('=== KALE Payment Debug Start ===');
    
    // Environment variables kontrolü
    if (!process.env.NEXT_PUBLIC_KALE_ISSUER) {
      throw new Error('NEXT_PUBLIC_KALE_ISSUER environment variable is not set. Please check your .env.local file.');
    }
    
    if (!process.env.NEXT_PUBLIC_KALE_TREASURY) {
      throw new Error('NEXT_PUBLIC_KALE_TREASURY environment variable is not set. Please check your .env.local file.');
    }
    
    console.log('Environment variables OK:', {
      issuer: process.env.NEXT_PUBLIC_KALE_ISSUER,
      treasury: process.env.NEXT_PUBLIC_KALE_TREASURY
    });
    
    const server = new Horizon.Server("https://horizon.stellar.org");
    const networkPassphrase = STELLAR_NETWORK_PASSPHRASE.PUBLIC;
    
    // Mainnet için özel StellarWalletsKit instance oluştur
    const { StellarWalletsKit, WalletNetwork, allowAllModules } = await import('@creit.tech/stellar-wallets-kit');
    const mainnetKit = new StellarWalletsKit({
      network: WalletNetwork.PUBLIC,
      modules: allowAllModules(),
    });
    
    console.log('Mainnet StellarWalletsKit created with network:', WalletNetwork.PUBLIC);
    
    // Wallet address kontrolü
    const { address: senderPublicKey } = await mainnetKit.getAddress();
    if (!senderPublicKey) {
      throw new Error('Wallet address not found. Please connect your wallet first.');
    }
    
    console.log('Sender public key:', senderPublicKey);
    
    let account;
    try {
      account = await server.loadAccount(senderPublicKey);
      console.log('Account loaded successfully:', account.accountId());
    } catch (e: any) {
      const msg = 'Your Stellar PUBLIC (mainnet) account was not found. Please fund it with base XLM and try again.';
      throw new Error(msg);
    }
    
    // KALE asset oluştur
    console.log('Creating KALE asset...');
    const kaleIssuer = getKaleIssuer();
    console.log('KALE issuer from function:', kaleIssuer);
    
    console.log('Asset constructor parameters:', {
      code: 'KALE',
      issuer: kaleIssuer,
      codeType: typeof 'KALE',
      issuerType: typeof kaleIssuer
    });
    
    const kaleAsset: Asset = new Asset('KALE', kaleIssuer);
    
    console.log('KALE Asset created:', {
      code: kaleAsset.getCode(),
      issuer: kaleAsset.getIssuer(),
      isNative: kaleAsset.isNative(),
      asset: kaleAsset,
      assetType: typeof kaleAsset,
      hasGetCode: typeof kaleAsset.getCode === 'function',
      hasGetIssuer: typeof kaleAsset.getIssuer === 'function'
    });
    
    if (!kaleAsset || !kaleAsset.getCode || !kaleAsset.getIssuer) {
      throw new Error('Invalid KALE asset configuration. Please check KALE_ISSUER environment variable.');
    }

    // Transaction builder
    console.log('Building transaction with:', {
      account: account.accountId(),
      fee: BASE_FEE,
      networkPassphrase,
      destination: params.destination,
      amount: params.amount
    });
    
    const txBuilder = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase,
    });
    
    console.log('TransactionBuilder created successfully');
    
    // ChangeTrust operation ekle
    console.log('Creating ChangeTrust operation...');
    console.log('ChangeTrust asset parameter:', kaleAsset);
    
    const changeTrustOp = Operation.changeTrust({ asset: kaleAsset });
    console.log('ChangeTrust operation created:', {
      operation: changeTrustOp,
      operationType: typeof changeTrustOp
    });
    
    if (!changeTrustOp) {
      throw new Error('ChangeTrust operation creation failed - operation is invalid');
    }
    
    txBuilder.addOperation(changeTrustOp);
    console.log('ChangeTrust operation added to transaction');
    
    // Payment operation ekle
    console.log('Creating Payment operation...');
    console.log('Payment parameters:', {
      destination: params.destination,
      asset: kaleAsset,
      amount: params.amount
    });
    
    const paymentOp = Operation.payment({
      destination: params.destination,
      asset: kaleAsset,
      amount: params.amount,
    });
    
    console.log('Payment operation created:', {
      operation: paymentOp,
      operationType: typeof paymentOp
    });
    
    if (!paymentOp) {
      throw new Error('Payment operation creation failed - operation is invalid');
    }
    
    txBuilder.addOperation(paymentOp);
    console.log('Payment operation added to transaction');

    if (params.memoText) {
      txBuilder.addMemo(Memo.text(params.memoText));
    }

    console.log('Building final transaction...');
    const tx = txBuilder.setTimeout(180).build();
    console.log('Transaction built successfully');
    
    // Transaction imzala
    console.log('Signing transaction...');
    const { signedTxXdr } = await mainnetKit.signTransaction(tx.toXDR(), { address: senderPublicKey, networkPassphrase });
    console.log('Transaction signed successfully');
    console.log('Signed transaction XDR:', signedTxXdr);
    
    // Transaction submit et
    console.log('Submitting transaction...');
    console.log('XDR type:', typeof signedTxXdr);
    console.log('XDR length:', signedTxXdr?.length);
    
    // XDR string'i Transaction objesine çevir
    let transactionToSubmit;
    try {
      if (typeof signedTxXdr === 'string') {
        transactionToSubmit = TransactionBuilder.fromXDR(signedTxXdr, networkPassphrase);
        console.log('Transaction parsed from XDR successfully');
      } else {
        throw new Error('signedTxXdr is not a string');
      }
    } catch (parseError) {
      console.error('Failed to parse XDR:', parseError);
      throw new Error('Invalid transaction XDR format');
    }
    
    const result = await server.submitTransaction(transactionToSubmit);
    console.log('Transaction submitted successfully:', result);
    
    console.log('=== KALE Payment Debug End ===');
    return result;
    
  } catch (error) {
    console.error('KALE payment failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error('Unknown error type:', error);
    }
    throw error;
  }
}


