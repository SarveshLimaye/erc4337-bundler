import { Account, Chain, Transport, WalletClient } from "viem";
import { account1, account2, eoa1, eoa2, publicClient } from "../config/config";
import { flushStuckTransaction } from "./flushStuckTransaction";
import { sepolia } from "viem/chains";

// Select the EOA to use
// First check pending transactions
// If there are no pending transactions, select an EOA with maximum NATIVE balance
// If there are pending transactions, select the EOA with the fewest pending transactions
// Currently the logic is written considering only two EOAs. But it can be extended to multiple EOAs by accepting an array of EOAs as input
export const selectEOA = async (): Promise<
  WalletClient<Transport, Chain, Account>
> => {
  // Fetch pending transaction counts for both EOAs
  const [pending1, pending2] = await Promise.all([
    getPendingTransactions(account1),
    getPendingTransactions(account2),
  ]);

  console.log(`Pending transactions: ${pending1} ${pending2}`);

  let selectedEOA: WalletClient<Transport, Chain, Account>;

  if (pending1 > 0 && pending2 > 0) {
    // Both EOAs have pending transactions; select the one with the fewest pending transactions
    if (pending1 === pending2) {
      const [balance1, balance2] = await Promise.all([
        publicClient.getBalance({ address: account1.address }),
        publicClient.getBalance({ address: account2.address }),
      ]);
      selectedEOA = balance1 > balance2 ? eoa1 : eoa2;
    } else {
      selectedEOA = pending1 < pending2 ? eoa1 : eoa2;
    }
  } else if (pending1 == 0 && pending2 != 0) {
    selectedEOA = eoa1;
  } else if (pending2 == 0 && pending1 != 0) {
    selectedEOA = eoa2;
  } else {
    // Neither EOA has pending transactions; select the one with the higher balance.
    const [balance1, balance2] = await Promise.all([
      publicClient.getBalance({ address: account1.address }),
      publicClient.getBalance({ address: account2.address }),
    ]);

    console.log(`Balances: ${balance1} ${balance2}`);
    console.log(`Selecting EOA with maximum balance`);
    selectedEOA = balance1 > balance2 ? eoa1 : eoa2;
  }

  console.log(`Selected EOA: ${selectedEOA.account.address}`);

  const selectedAccount = selectedEOA === eoa1 ? account1 : account2;
  let gasPrice: {
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
  };

  // Currenly only sepolia chain is supported
  const fees = await publicClient.estimateFeesPerGas({
    chain: sepolia,
  });

  gasPrice = {
    maxFeePerGas: fees.maxFeePerGas,
    maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
  };

  // Flush stuck transactions for the selected EOA
  await flushStuckTransaction(
    publicClient,
    selectedEOA,
    selectedAccount,
    gasPrice.maxFeePerGas * BigInt(5)
  );
  return selectedEOA;
};

const getPendingTransactions = async (wallet: Account): Promise<number> => {
  try {
    const pendingTransactions = await publicClient.getTransactionCount({
      address: wallet.address,
      blockTag: "pending",
    });
    return pendingTransactions;
  } catch (error) {
    console.error(
      `Error fetching pending transactions for ${wallet.address}:`,
      error
    );
    return 0; // Assume no pending transactions if there's an error
  }
};
