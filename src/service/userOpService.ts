import { executeUserOp } from "../handler/executeUserOp";

export const sendUserOperation = async (userOp: any, beneficiary: string) => {
  try {
    const result = await executeUserOp(userOp, beneficiary);
    return { success: true, txHash: result.txHash };
  } catch (error: any) {
    console.error("Error executing UserOperation:", error);
    return { success: false, error: error.message };
  }
};
