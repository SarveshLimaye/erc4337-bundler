import { config as dotEnvConfig } from "dotenv";
import { createWalletClient, createPublicClient, http, Hex } from "viem";
import { loadBalance } from "@ponder/utils";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
dotEnvConfig();

export const RPC_URL_1 = process.env.RPC_URL_1;
export const RPC_URL_2 = process.env.RPC_URL_2;
export const ENTRY_POINT_ADDRESS = process.env.ENTRY_POINT_ADDRESS;
export const EOA1_PRIVATE_KEY = process.env.EOA1_PRIVATE_KEY_1;
export const EOA2_PRIVATE_KEY = process.env.EOA2_PRIVATE_KEY_2;

export const publicClient = createPublicClient({
  chain: sepolia,
  //Load balance requests across multiple rpc
  // It manages rpc requests using a simple round-robin strategy
  // Read mire here -
  transport: loadBalance([
    http(RPC_URL_1, {
      // Retry failed requests 3 times with a delay of 500ms
      // Used to handle network failures
      retryCount: 3,
      retryDelay: 500,
    }),
    http(RPC_URL_2, {
      // Retry failed requests 3 times with a delay of 500ms
      // Used to handle network failures
      retryCount: 3,
      retryDelay: 500,
    }),
  ]),
});

export const account1 = privateKeyToAccount(EOA1_PRIVATE_KEY as Hex);
export const account2 = privateKeyToAccount(EOA2_PRIVATE_KEY as Hex);

// Initialize wallet clients (EOAs)
export const eoa1 = createWalletClient({
  chain: sepolia,
  transport: loadBalance([
    http(RPC_URL_1, {
      // Retry failed requests 3 times with a delay of 500ms
      // Used to handle network failures
      retryCount: 3,
      retryDelay: 500,
    }),
    http(RPC_URL_2, {
      // Retry failed requests 3 times with a delay of 500ms
      // Used to handle network failures
      retryCount: 3,
      retryDelay: 500,
    }),
  ]),
  account: account1,
});

export const eoa2 = createWalletClient({
  chain: sepolia,
  transport: loadBalance([
    http(RPC_URL_1, {
      // Retry failed requests 3 times with a delay of 500ms
      // Used to handle network failures
      retryCount: 3,
      retryDelay: 500,
    }),
    http(RPC_URL_2, {
      // Retry failed requests 3 times with a delay of 500ms
      // Used to handle network failures
      retryCount: 3,
      retryDelay: 500,
    }),
  ]),
  account: account2,
});
