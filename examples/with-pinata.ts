/**
 * Example using Pinata storage
 */

import { ChaosChainSDK, PinataStorage, NetworkConfig, AgentRole } from '../src';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Initialize SDK with Pinata storage
  const sdk = new ChaosChainSDK({
    agentName: 'PinataAgent',
    agentDomain: 'pinata.example.com',
    agentRole: AgentRole.SERVER,
    network: NetworkConfig.BASE_SEPOLIA,
    privateKey: process.env.PRIVATE_KEY,
    storageProvider: new PinataStorage({
      jwt: process.env.PINATA_JWT!,
      gatewayUrl: 'https://gateway.pinata.cloud',
    }),
  });

  console.log('🚀 SDK initialized with Pinata storage');

  // Upload data to Pinata
  console.log('\n📤 Uploading to Pinata...');
  const data = {
    message: 'Hello from ChaosChain!',
    timestamp: Date.now(),
    agent: 'PinataAgent',
  };

  const result = await sdk.storage.upload(data, {
    mime: 'application/json',
    metadata: {
      name: 'chaoschain-test',
      keyvalues: {
        agent: 'PinataAgent',
        type: 'test',
      },
    },
  });

  console.log(`✅ Uploaded to Pinata!`);
  console.log(`📦 CID: ${result.cid}`);
  console.log(`🔗 URI: ${result.uri}`);
  console.log(`📏 Size: ${result.size} bytes`);

  // Download data back
  console.log('\n📥 Downloading from Pinata...');
  const downloaded = await sdk.storage.download(result.cid);
  const parsed = JSON.parse(downloaded.toString());
  console.log('✅ Downloaded:', parsed);

  console.log('\n✨ Pinata example completed!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

