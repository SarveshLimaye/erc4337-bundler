import { z } from "zod";
import { type Hash, type Hex, getAddress, maxUint256 } from "viem";

//Regex patterns for hex data and address
const hexDataPattern = /^0x[0-9A-Fa-f]*$/;
const addressPattern = /^0x[0-9,a-f,A-F]{40}$/;

const addressSchema = z
  .string()
  .regex(addressPattern, { message: "not a valid hex address" })
  .transform((val) => getAddress(val));

const hexNumberSchema = z
  .string()
  .regex(hexDataPattern)
  .or(z.number())
  .or(z.bigint())
  .transform((val) => BigInt(val))
  .refine((val) => val <= maxUint256, {
    message: "not a valid uint256",
  });
const hexDataSchema = z
  .string()
  .regex(hexDataPattern, { message: "not valid hex data" })
  .transform((val) => val as Hex);

const userOperationSchema = z
  .object({
    sender: addressSchema,
    nonce: hexNumberSchema,
    initCode: hexDataSchema,
    callData: hexDataSchema,
    callGasLimit: hexNumberSchema,
    verificationGasLimit: hexNumberSchema,
    preVerificationGas: hexNumberSchema,
    maxPriorityFeePerGas: hexNumberSchema,
    maxFeePerGas: hexNumberSchema,
    paymasterAndData: hexDataSchema,
    signature: hexDataSchema,
  })
  .strict()
  .transform((val) => {
    return val;
  });

export type UserOperation = z.infer<typeof userOperationSchema>;
