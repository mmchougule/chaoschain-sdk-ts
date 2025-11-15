# ERC-8004 Integration

This document describes how to use the ERC-8004 integration in the ChaosChain TypeScript SDK.

## Overview

The ERC-8004 integration provides client wrapper methods for interacting with ERC-8004 contracts deployed on BSC Testnet (chainId 97). The integration includes:

- **IdentityRegistry**: Agent registration and metadata management
- **ReputationRegistry**: Feedback and reputation tracking
- **ValidationRegistry**: Validation proof submission

## Installation

The ERC-8004 client is included in the ChaosChain SDK:

```typescript
import { ERC8004Client } from '@chaoschain/sdk/integrations/erc8004';
```

## Usage

### Basic Setup

```typescript
import { ethers } from 'ethers';
import { ERC8004Client, BSC_TESTNET_ADDRESSES } from '@chaoschain/sdk/integrations/erc8004';

// Connect to BSC Testnet
const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');

// For read-only operations
const client = new ERC8004Client(provider, BSC_TESTNET_ADDRESSES);

// For write operations, provide a signer
const wallet = new ethers.Wallet(privateKey, provider);
const clientWithSigner = new ERC8004Client(provider, BSC_TESTNET_ADDRESSES, wallet);
```

### Identity Registry Operations

#### Get Contract Information

```typescript
// Get contract name and symbol
const name = await client.name();
const symbol = await client.symbol();

console.log(`Contract: ${name} (${symbol})`);

// Check ERC-721 support
const isERC721 = await client.supportsERC721();
console.log(`Supports ERC-721: ${isERC721}`);
```

#### Register an Agent

```typescript
const agentId = await clientWithSigner.register(
  '0xYourAddress',
  'ipfs://QmYourMetadataURI'
);
console.log(`Registered agent with ID: ${agentId}`);
```

#### Set and Get Metadata

```typescript
// Set metadata
await clientWithSigner.setMetadata(agentId, 'version', '1.0.0');
await clientWithSigner.setMetadata(agentId, 'capabilities', 'text-generation');

// Get metadata
const version = await client.getMetadata(agentId, 'version');
console.log(`Agent version: ${version}`);

// Get owner
const owner = await client.ownerOf(agentId);
console.log(`Agent owner: ${owner}`);
```

### Reputation Registry Operations

#### Give Feedback with EIP-712 Signature

```typescript
import { ethers } from 'ethers';

// Prepare feedback data
const feedback = {
  agentId: BigInt(123),
  score: 85,
  tags: ['helpful', 'accurate'],
  uri: 'ipfs://QmFeedbackURI',
  hash: ethers.keccak256(ethers.toUtf8Bytes('feedback content')),
};

// Build EIP-712 domain
const chainId = 97; // BSC Testnet
const domain = client.buildReputationEIP712Domain(
  chainId,
  BSC_TESTNET_ADDRESSES.reputation
);

// Sign the feedback authorization
const auth = await client.signFeedbackAuth(wallet, feedback, domain);

// Submit feedback
await clientWithSigner.giveFeedback(
  feedback.agentId,
  feedback.score,
  feedback.tags,
  feedback.uri,
  feedback.hash,
  auth
);

console.log('Feedback submitted successfully');
```

#### Get Feedback Summary

```typescript
const summary = await client.getFeedbackSummary(agentId);
console.log(`Feedback count: ${summary.count}`);
console.log(`Average score: ${summary.avgScore}`);
```

#### Revoke Feedback

```typescript
await clientWithSigner.revokeFeedback();
console.log('Feedback revoked');
```

### Validation Registry Operations

#### Submit Validation

```typescript
await clientWithSigner.submitValidation(
  agentId,
  'ipfs://QmValidationProofURI'
);
console.log('Validation submitted');
```

#### Get Validations

```typescript
const validations = await client.getValidations(agentId);
console.log(`Agent has ${validations.length} validations`);
```

## Network Configuration

The integration includes pre-configured addresses for BSC Testnet (chainId 97):

```typescript
import { BSC_TESTNET_ERC8004, getERC8004Addresses } from '@chaoschain/sdk/config/networks/erc8004';

// Get addresses for BSC Testnet
const addresses = getERC8004Addresses(97);
console.log('Identity Registry:', addresses.identity);
console.log('Reputation Registry:', addresses.reputation);
console.log('Validation Registry:', addresses.validation);
```

## Complete Example

```typescript
import { ethers } from 'ethers';
import { ERC8004Client, BSC_TESTNET_ADDRESSES } from '@chaoschain/sdk/integrations/erc8004';

async function main() {
  // Setup
  const provider = new ethers.JsonRpcProvider(
    process.env.BSC_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545'
  );
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const client = new ERC8004Client(provider, BSC_TESTNET_ADDRESSES, wallet);

  // Register an agent
  const agentId = await client.register(wallet.address, 'ipfs://QmAgentMetadata');
  console.log(`Agent registered: ${agentId}`);

  // Set metadata
  await client.setMetadata(agentId, 'name', 'MyAgent');
  await client.setMetadata(agentId, 'version', '1.0.0');

  // Give feedback
  const feedback = {
    agentId,
    score: 90,
    tags: ['excellent'],
    uri: 'ipfs://QmFeedback',
    hash: ethers.keccak256(ethers.toUtf8Bytes('great work')),
  };

  const domain = client.buildReputationEIP712Domain(97, BSC_TESTNET_ADDRESSES.reputation);
  const auth = await client.signFeedbackAuth(wallet, feedback, domain);
  
  await client.giveFeedback(
    feedback.agentId,
    feedback.score,
    feedback.tags,
    feedback.uri,
    feedback.hash,
    auth
  );

  // Get summary
  const summary = await client.getFeedbackSummary(agentId);
  console.log(`Feedback: ${summary.count} entries, avg score: ${summary.avgScore}`);
}

main().catch(console.error);
```

## Notes

- All write operations require a signer to be provided when creating the client
- The contract addresses in this integration are placeholders and should be updated with actual deployed addresses
- EIP-712 signatures are required for giving feedback to ensure authenticity
- Make sure to handle errors appropriately in production code
- Always verify transaction receipts before assuming operations succeeded

## Environment Variables

For testing and development, set the following environment variables:

```bash
export BSC_TESTNET_RPC="https://data-seed-prebsc-1-s1.binance.org:8545"
export PRIVATE_KEY="your-private-key"
```

## Related Documentation

- [ERC-8004 Standard](https://eips.ethereum.org/EIPS/eip-8004)
- [BSC Testnet Documentation](https://docs.bnbchain.org/docs/testnet)
- [Ethers.js Documentation](https://docs.ethers.org/)
