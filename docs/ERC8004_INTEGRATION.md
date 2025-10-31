# ERC-8004 Integration (ChaosChain SDK)

This document explains the integration added for ERC-8004 registries (Identity, Reputation, Validation) and how to use them with the ChaosChain SDK.

## Deployed BSC Testnet Addresses
- Chain ID: 97
- IdentityRegistry (proxy): 0xabbd26d86435b35d9c45177725084ee6a2812e40
- ReputationRegistry (proxy): 0xeced1af52a0446275e9e6e4f6f26c99977400a6a
- ValidationRegistry (proxy): 0x7866bd057f09a4940fe2ce43320518c8749a921e

## Usage Example

```ts
import { ethers } from "ethers";
import { ERC8004Client, BSC_TESTNET_ADDRESSES } from "path/to/integrations/erc8004";

const provider = new ethers.JsonRpcProvider(process.env.BSC_TESTNET_RPC);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const client = new ERC8004Client(signer, BSC_TESTNET_ADDRESSES);

// register an agent (mint NFT)
await client.register(signer.address, "ipfs://Qm...");

// get metadata
const meta = await client.getMetadata(1, "profile");

// prepare feedback signature (EIP-712)
const payload = {
  agentId: 1,
  score: 95,
  tags: ["delivery", "quality"],
  uri: "ipfs://QmFeedback...",
  hash: "0x0123...deadbeef",
  nonce: 1,
  expiry: Math.floor(Date.now() / 1000) + 3600
};
const authSig = await client.signFeedbackAuth(signer, payload);

// submit feedback
await client.giveFeedback(payload.agentId, payload.score, payload.tags, payload.uri, payload.hash, authSig);
```

## Notes & Recommendations
- The signFeedbackAuth uses EIP-712 typed data per the report (nonce and expiry included to prevent replay).
- The ABIs included are intentionally minimal; extend them if your on-chain contracts expose additional functions/events (e.g., events for minted agent, feedback given).
- Add tests covering:
  - supportsInterface(ERC721)
  - register minted token & ownerOf
  - giveFeedback with EIP-712 signature successful and anti-self-feedback checks
  - replays prevented by nonce+expiry
