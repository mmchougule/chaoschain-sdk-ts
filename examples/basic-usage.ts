/**
 * Basic Usage Example
 * Demonstrates core SDK functionality
 */

import { ChaosChainSDK, NetworkConfig, AgentRole } from '../src';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Initialize SDK
  const sdk = new ChaosChainSDK({
    agentName: 'ExampleAgent',
    agentDomain: 'example.com',
    agentRole: AgentRole.SERVER,
    network: NetworkConfig.BASE_SEPOLIA,
    privateKey: process.env.PRIVATE_KEY,
    enablePayments: true,
    enableStorage: true,
  });

  console.log('🚀 ChaosChain SDK initialized');
  console.log(`📍 Network: ${sdk.network}`);
  console.log(`💼 Wallet: ${sdk.getAddress()}`);

  // 1. Register on-chain identity
  console.log('\n1️⃣ Registering agent identity...');
  const { agentId, txHash } = await sdk.registerIdentity();
  console.log(`✅ Agent #${agentId} registered`);
  console.log(`📝 Transaction: ${txHash}`);

  // 2. Update metadata
  console.log('\n2️⃣ Updating agent metadata...');
  await sdk.updateAgentMetadata(agentId, {
    name: 'ExampleAgent',
    domain: 'example.com',
    role: AgentRole.SERVER,
    description: 'Example AI agent for testing',
    capabilities: ['analysis', 'inference'],
    supportedTrust: ['reputation', 'validation'],
  });
  console.log('✅ Metadata updated');

  // 3. Store evidence
  console.log('\n3️⃣ Storing evidence on IPFS...');
  const evidence = {
    agentId: agentId.toString(),
    timestamp: Date.now(),
    action: 'registration',
    metadata: { version: '1.0' },
  };
  const cid = await sdk.storeEvidence(evidence);
  console.log(`✅ Evidence stored: ipfs://${cid}`);

  // 4. Check balances
  console.log('\n4️⃣ Checking balances...');
  const ethBalance = await sdk.getETHBalance();
  const usdcBalance = await sdk.getUSDCBalance();
  console.log(`💰 ETH Balance: ${ethBalance}`);
  console.log(`💵 USDC Balance: ${usdcBalance}`);

  // 5. Get agent stats
  console.log('\n5️⃣ Getting agent stats...');
  const stats = await sdk.getAgentStats(agentId);
  console.log(`📊 Total Feedback: ${stats.totalFeedback}`);
  console.log(`⭐ Average Rating: ${stats.averageRating}`);

  console.log('\n✨ Example completed successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

