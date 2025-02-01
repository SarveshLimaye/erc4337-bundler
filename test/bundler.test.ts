// @notice - Added below code to fix the error: "Not able to serialize BigInt"
// Find the sol here : https://github.com/GoogleChromeLabs/jsbi/issues/30
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import {
  Address,
  createWalletClient,
  http,
  parseUnits,
  publicActions,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { executeUserOp } from "../src/handler/executeUserOp";
import { sepolia } from "viem/chains";
import { config as dotEnvConfig } from "dotenv";
import {
  BiconomySmartAccountV2,
  createSmartAccountClient,
  UserOperationStruct,
} from "@biconomy/account";
import { validateRequest } from "../src/handler/validations";
import { UserOperation } from "viem/account-abstraction";

dotEnvConfig();

describe("eth_sendUserOperation", () => {
  const privateKey = process.env.PRIVATE_KEY_TEST;

  if (!privateKey) {
    throw new Error("PRIVATE_KEY is not defined");
  }

  const bundlerUrl = process.env.BUNDLER_URL!;

  const paymasterApiKey = process.env.PAYMASTER_API_KEY;

  const valueToSend = 1n; // send only 1 wei

  const topUpSmartAccountValue = parseUnits("0.1", 18);

  const account = privateKeyToAccount(`0x${privateKey}`);

  const signer = createWalletClient({
    account,
    chain: sepolia,
    transport: http(),
  }).extend(publicActions);

  let smartAccount: BiconomySmartAccountV2;

  const tx = {
    to: account.address,
    value: 1n,
  };

  beforeEach(async () => {
    smartAccount = await createSmartAccountClient({
      signer,
      bundlerUrl,
      biconomyPaymasterApiKey: paymasterApiKey,
    });

    console.log("Smart account address:", await smartAccount.getAddress());
    const balances = await smartAccount.getBalances();
    const nativeBalance = balances[balances.length - 1];

    console.log("Native balance:", nativeBalance);

    if (nativeBalance.amount < topUpSmartAccountValue) {
      console.log(`Sending ${topUpSmartAccountValue} wei to smart account`);
      const hash = await signer.sendTransaction({
        to: await smartAccount.getAddress(),
        value: topUpSmartAccountValue,
      });

      console.log("Top up transaction hash:", hash);
    }

    if (!smartAccount.isAccountDeployed) {
      // Send some value to account to avoid AA20 error
      const { wait } = await smartAccount.sendTransaction({
        to: account.address,
        value: valueToSend,
      });

      const {
        receipt: { transactionHash },
        success,
      } = await wait();

      console.log("Transaction hash:", transactionHash);
      console.log("Transaction success:", success);
    }
  });

  it("should execute user operation", async () => {
    console.log("Signing user operation...");

    const unestimatedUserOperation: Partial<UserOperationStruct> =
      await smartAccount.signUserOp({
        sender: await smartAccount.getAccountAddress(),
        nonce: await smartAccount.getNonce(),
        initCode: "0x",
        callData: await smartAccount.encodeExecute(tx.to, tx.value, "0x"),
        callGasLimit: 1n,
        verificationGasLimit: 1n,
        preVerificationGas: 1n,
        maxFeePerGas: 1n,
        maxPriorityFeePerGas: 1n,
        paymasterAndData: "0x",
      });

    const gasEstimate = await smartAccount.bundler?.estimateUserOpGas(
      unestimatedUserOperation
    );

    console.log("Gas estimate:", gasEstimate);
    const {
      callGasLimit,
      verificationGasLimit,
      preVerificationGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
    } = gasEstimate!;

    let estimatedUserOperation = await smartAccount.signUserOp({
      ...unestimatedUserOperation,
      callGasLimit: BigInt(callGasLimit),
      verificationGasLimit: BigInt(verificationGasLimit),
      preVerificationGas: BigInt(preVerificationGas),
      maxFeePerGas: BigInt(maxFeePerGas),
      maxPriorityFeePerGas: BigInt(maxPriorityFeePerGas),
    });

    estimatedUserOperation = await smartAccount.signUserOp(
      estimatedUserOperation
    );

    // Send user operation to executeUserOp

    const result = await executeUserOp(estimatedUserOperation, account.address);

    console.log("User operation result:", result);

    expect(result).toHaveProperty("txHash");
    expect(result.receipt.status).toContain("success");
  });

  it("should throw an error if verificationGasLimit is less than 10000", async () => {
    const invalidUserOp: UserOperation = {
      sender: await smartAccount.getAccountAddress(),
      nonce: await smartAccount.getNonce(),
      initCode: "0x",
      callData: await smartAccount.encodeExecute(tx.to, tx.value, "0x"),
      callGasLimit: 1n,
      verificationGasLimit: 9999n, // Invalid value
      preVerificationGas: 1n,
      maxFeePerGas: 1n,
      maxPriorityFeePerGas: 1n,
      paymasterAndData: "0x",
      signature: "0x",
    };

    const entryPoint: Address = process.env.ENTRY_POINT_ADDRESS! as Address;
    await expect(validateRequest(invalidUserOp, entryPoint)).rejects.toThrow(
      "verificationGasLimit must be at least 10000"
    );
  });

  it("should throw an error if gas limits are zero", async () => {
    const invalidUserOp: UserOperation = {
      sender: await smartAccount.getAccountAddress(),
      nonce: await smartAccount.getNonce(),
      initCode: "0x",
      callData: await smartAccount.encodeExecute(tx.to, tx.value, "0x"),
      callGasLimit: 0n, // Invalid value
      verificationGasLimit: 70649n,
      preVerificationGas: 0n, // Invalid value
      maxFeePerGas: 1n,
      maxPriorityFeePerGas: 1n,
      paymasterAndData: "0x",
      signature: "0x",
    };

    const entryPoint: Address = process.env.ENTRY_POINT_ADDRESS! as Address;

    await expect(validateRequest(invalidUserOp, entryPoint)).rejects.toThrow(
      "user operation gas limits must be larger than 0"
    );
  });

  it("should throw an error if nonce is invalid", async () => {
    const invalidUserOp: UserOperation = {
      sender: await smartAccount.getAccountAddress(),
      nonce: 9999n, // Invalid nonce
      initCode: "0x",
      callData: await smartAccount.encodeExecute(tx.to, tx.value, "0x"),
      callGasLimit: 1n,
      verificationGasLimit: 10000n,
      preVerificationGas: 1n,
      maxFeePerGas: 1n,
      maxPriorityFeePerGas: 1n,
      paymasterAndData: "0x",
      signature: "0x",
    };

    const entryPoint: Address = process.env.ENTRY_POINT_ADDRESS! as Address;

    await expect(validateRequest(invalidUserOp, entryPoint)).rejects.toThrow(
      "AA25 invalid account nonce"
    );
  });
});
