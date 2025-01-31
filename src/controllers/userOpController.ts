import { Request, Response } from "express";
import { sendUserOperation } from "../service/userOpService";
import { UserOperation } from "../schema/schema";

export const sendUserOpHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { jsonrpc, method, params, id } = req.body;

  if (method !== "eth_sendUserOperation") {
    return res.status(400).json({
      jsonrpc: "2.0",
      error: { code: -32601, message: "Method not found" },
      id,
    });
  }

  const userOp: UserOperation = params[0];
  const beneficiary: string = params[1];

  const result = await sendUserOperation(userOp, beneficiary);

  if (result.success) {
    return res.json({
      jsonrpc: jsonrpc,
      txHash: result.txHash,
      id,
      status: "success",
    });
  } else {
    return res.status(500).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Execution error", data: result.error },
      id,
      status: "failure",
    });
  }
};
