/**
 * x402 Payment Example
 * Demonstrates crypto payments using HTTP 402 protocol
 */

import { ChaosChainSDK, NetworkConfig, AgentRole } from '../src';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const sdk = new ChaosChainSDK({
    agentName: 'PaymentAgent',
    agentDomain: 'payment.example.com',
    agentRole: AgentRole.SERVER,
    network: NetworkConfig.BASE_SEPOLIA,
    privateKey: process.env.PRIVATE_KEY,
    enablePayments: true,
  });

  console.log('🚀 Payment Agent initialized');
  console.log(`💼 Address: ${sdk.getAddress()}`);

  // Check balances
  console.log('\n💰 Checking balances...');
  const ethBalance = await sdk.getETHBalance();
  const usdcBalance = await sdk.getUSDCBalance();
  console.log(`ETH: ${ethBalance}`);
  console.log(`USDC: ${usdcBalance}`);

  // Calculate payment with fees
  console.log('\n🧮 Calculate payment costs...');
  const costs = sdk.calculateTotalCost('10.0', 'USDC');
  console.log(`Amount: ${costs.amount} USDC`);
  console.log(`Fee (2.5%): ${costs.fee} USDC`);
  console.log(`Total: ${costs.total} USDC`);

  // Create payment requirements (HTTP 402 response)
  console.log('\n📋 Creating payment requirements...');
  const requirements = sdk.createX402PaymentRequirements(
    '5.0',
    'USDC',
    'Premium AI Analysis Service'
  );
  console.log('Status:', requirements.statusCode);
  console.log('Headers:', requirements.headers);
  console.log('Body:', JSON.stringify(requirements.body, null, 2));

  // Execute payment (uncomment to test with real funds)
  /*
  console.log('\n💸 Executing x402 payment...');
  const payment = await sdk.executeX402Payment({
    toAgent: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1', // Replace with recipient
    amount: '1.0',
    currency: 'USDC',
    serviceType: 'analysis',
  });

  console.log('✅ Payment successful!');
  console.log(`From: ${payment.from}`);
  console.log(`To: ${payment.to}`);
  console.log(`Amount: ${payment.amount} ${payment.currency}`);
  console.log(`Fee: ${payment.feeAmount} ${payment.currency}`);
  console.log(`Main TX: ${payment.txHash}`);
  console.log(`Fee TX: ${payment.feeTxHash}`);
  */

  console.log('\n✨ Payment example completed!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

