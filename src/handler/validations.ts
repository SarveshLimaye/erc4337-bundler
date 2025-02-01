import { Address, getContract } from "viem";
import { UserOperation } from "viem/account-abstraction";
import { entrypointabi } from "../abis/entrypointabi";
import { publicClient } from "../config/config";

// Helper function to convert hex string or number to BigInt
const toBigInt = (value: string | number | bigint): bigint => {
  if (typeof value === "string" && value.startsWith("0x")) {
    return BigInt(value); // viem's BigInt can handle hex strings directly
  }
  return BigInt(value);
};

const getNonceKeyAndValue = (
  nonce: string | bigint | number
): [bigint, bigint] => {
  const bignonce = toBigInt(nonce);

  const MASK_64 = BigInt("0xffffffffffffffff");
  const nonceKey = bignonce >> 64n;
  const nonceSequence = bignonce & MASK_64;

  return [nonceKey, nonceSequence];
};

export const validateRequest = async (
  userOp: UserOperation,
  entryPoint: Address
) => {
  // Convert hex strings to BigInt
  const verificationGasLimit = toBigInt(userOp.verificationGasLimit);
  console.log(`Verification gas limit: ${verificationGasLimit}`);
  const preVerificationGas = toBigInt(userOp.preVerificationGas);

  if (verificationGasLimit < 10000n) {
    const reason = "verificationGasLimit must be at least 10000";
    throw new Error(reason);
  }

  if (preVerificationGas === 0n || verificationGasLimit === 0n) {
    const reason = "user operation gas limits must be larger than 0";
    throw new Error(reason);
  }

  const currentNonceValue = await getNonceValue(userOp, entryPoint);
  const [, userOperationNonceValue] = getNonceKeyAndValue(userOp.nonce);

  if (userOperationNonceValue !== currentNonceValue) {
    const reason = `UserOperation failed validation with reason: AA25 invalid account nonce`;
    throw new Error(reason);
  }
};

const getNonceValue = async (
  userOperation: UserOperation,
  entryPoint: Address
) => {
  const entryPointContract = getContract({
    address: entryPoint,
    abi: entrypointabi,
    client: {
      public: publicClient,
    },
  });

  const [nonceKey] = getNonceKeyAndValue(userOperation.nonce);

  const getNonceResult = await entryPointContract.read.getNonce(
    [userOperation.sender, nonceKey],
    {
      blockTag: "latest",
    }
  );

  const nonceResultBigInt = toBigInt(
    getNonceResult as string | number | bigint
  );
  const [_, currentNonceValue] = getNonceKeyAndValue(nonceResultBigInt);

  return currentNonceValue;
};
