import { config as dotEnvConfig } from "dotenv";
import { createWalletClient, createPublicClient, http, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
dotEnvConfig();

export const RPC_URL = process.env.RPC_URL;
export const ENTRY_POINT_ADDRESS = process.env.ENTRY_POINT_ADDRESS;
export const EOA1_PRIVATE_KEY = process.env.EOA1_PRIVATE_KEY_1;
export const EOA2_PRIVATE_KEY = process.env.EOA2_PRIVATE_KEY_2;

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

const account1 = privateKeyToAccount(EOA1_PRIVATE_KEY as Hex);
const account2 = privateKeyToAccount(EOA2_PRIVATE_KEY as Hex);

// Initialize wallet clients (EOAs)
export const eoa1 = createWalletClient({
  chain: sepolia,
  transport: http(RPC_URL),
  account: account1,
});

export const eoa2 = createWalletClient({
  chain: sepolia,
  transport: http(RPC_URL),
  account: account2,
});
