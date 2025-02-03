## ERC 4337 Bundler

A minimal bundler node that accepts ERC-4337 UserOperations, execute them on supported chain and return the transaction hash in response.

### Local Setup

1. Install all the dependencies using following command -

   ```
   yarn
   ```

2. Set up all the environment variables . Create a file named .env in the root folder. Configure the .env file according to the provided .env.example file.

3. Run the bundler node using following command -

   ```
   yarn run start
   ```

### Testing

The node functionality can be tested out in 2 ways -

1.  #### Run jest test

    To run the Jest test suite, use the following command:

            yarn test

    The test suite covers the following scenarios:

    - Sending UserOperations:
      Tests the end-to-end flow of sending a UserOperation, including gas estimation, signing, and execution. It verifies that the transaction is successfully executed and returns a valid transaction hash.

    - Validation Checks:
      Tests the validateRequest function to ensure it correctly validates UserOperation objects. This includes:

    - Ensuring verificationGasLimit is at least 10000.
    - Ensuring gas limits (callGasLimit, verificationGasLimit, preVerificationGas) are greater than 0.
    - Ensuring the nonce is valid and matches the expected value.

    - Error Handling:
      Tests that the bundler node handles invalid UserOperation objects gracefully by throwing appropriate errors.

2.  #### Manual Testing

    The bundler node can be tested by sending UserOperation objects to the node's API endpoint {localendpoint}/bundler and verifying the response -

    Sample request body -

```
{
    "jsonrpc": "2.0",
    "method": "eth_sendUserOperation",
    "params": [
        {
            "sender": "0x4E20071aA194A8298DF735a1e500bDA6dF537953",
            "nonce": "0xd",
            "initCode": "0x",
            "callData": "0x0000189a000000000000000000000000747a4168db14f57871fa8cda8b5455d8c2a8e90a000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
            "paymasterAndData": "0x",
            "maxFeePerGas": "0x4d4cff40",
            "maxPriorityFeePerGas": "0x9d25c5",
            "verificationGasLimit": "0x113f9",
            "callGasLimit": "0x3c6a",
            "preVerificationGas": "0xe31f",
            "signature": "0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000001c5b32f37f5bea87bdd5374eb2ac54ea8e00000000000000000000000000000000000000000000000000000000000000417892471c91ba9e6c77335641ce63fb15e15decb0f2b3feb3c9bee18e786321fb7b333a448939a8d244c947e24a02416ea3787fae3238a658db68e41671d10e561c00000000000000000000000000000000000000000000000000000000000000"
        },
        "0x19661D036D4e590948b9c00eef3807b88fBfA8e1"
    ],
    "id": 1738442270
}

```

Sample Sepolia Tx sent from bundler - https://eth-sepolia.blockscout.com/tx/0x7ffd6288128b9cc32cbd945fcf31e3711f122cf95b2b5f2874e78b1f896978b4

### Questions or Issues?

If you have any questions or encounter issues, please reach out to me at sarveshlimaye2002@gmail.com or open an issue.

```
### Note - Currently the bundler is only configured for sepolia testnet.
```
