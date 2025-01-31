import {
  ENTRY_POINT_ADDRESS,
  eoa1,
  eoa2,
  publicClient,
} from "../config/config";
import { Hex } from "viem";
import { entrypointabi } from "../abis/entrypointabi";
import { selectEOA } from "./selectEoa";

export const executeUserOp = async (userOp: any, beneficiary: string) => {
  // Select the EOA to use
  const eoa = await selectEOA();

  // Send the transaction
  const txHash = await eoa.writeContract({
    address: ENTRY_POINT_ADDRESS as Hex,
    abi: entrypointabi,
    functionName: "handleOps",
    args: [[userOp], beneficiary],
  });

  console.log(`Transaction sent by ${eoa.account.address}: ${txHash}`);

  // Wait for the transaction to be mined
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
  });
  console.log("Transaction receipt:", receipt);

  return { txHash, receipt };
};
