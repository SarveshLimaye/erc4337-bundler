import { Account, Chain, PublicClient, Transport, WalletClient } from "viem";

export async function flushStuckTransaction(
  publicClient: PublicClient,
  walletClient: WalletClient<Transport, Chain, Account>,
  wallet: Account,
  gasPrice: bigint
) {
  console.log(`Flushing stuck transactions for ${wallet.address}`);
  const latestNonce = await publicClient.getTransactionCount({
    address: wallet.address,
    blockTag: "latest",
  });
  const pendingNonce = await publicClient.getTransactionCount({
    address: wallet.address,
    blockTag: "pending",
  });

  // same nonce is okay
  if (latestNonce === pendingNonce) {
    console.log(`No stuck transactions for ${wallet.address}`);
    return;
  }

  // one nonce ahead is also okay
  if (latestNonce + 1 === pendingNonce) {
    console.log(`No stuck transactions for ${wallet.address}`);
    return;
  }

  for (
    let nonceToFlush = latestNonce;
    nonceToFlush < pendingNonce;
    nonceToFlush++
  ) {
    try {
      const txHash = await walletClient.sendTransaction({
        account: wallet,
        to: wallet.address,
        value: BigInt(0),
        nonce: nonceToFlush,
        maxFeePerGas: gasPrice,
        maxPriorityFeePerGas: gasPrice,
      });

      console.log(
        `Flushed stuck transaction with nonce ${nonceToFlush} for ${wallet.address}: ${txHash}`
      );
    } catch (e) {
      console.error(
        `Error flushing transaction with nonce ${nonceToFlush} for ${wallet.address}:`,
        e
      );

      // Add retry logic here
    }
  }
}
