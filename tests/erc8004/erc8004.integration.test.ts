/**
 * ERC-8004 Integration Tests
 * 
 * These tests verify basic functionality of the ERC-8004 client.
 * They are guarded by the BSC_TESTNET_RPC environment variable to prevent CI failures.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { ethers } from 'ethers';
import { ERC8004Client, BSC_TESTNET_ADDRESSES } from '../../src/integrations/erc8004';

// Skip tests if BSC_TESTNET_RPC is not set
const BSC_TESTNET_RPC = process.env.BSC_TESTNET_RPC;
const shouldSkip = !BSC_TESTNET_RPC;

describe.skipIf(shouldSkip)('ERC-8004 Integration', () => {
  let provider: ethers.JsonRpcProvider;
  let client: ERC8004Client;

  beforeAll(() => {
    if (!BSC_TESTNET_RPC) {
      return;
    }
    
    provider = new ethers.JsonRpcProvider(BSC_TESTNET_RPC);
    client = new ERC8004Client(provider, BSC_TESTNET_ADDRESSES);
  });

  describe('Identity Registry', () => {
    it('should get contract name', async () => {
      const name = await client.name();
      expect(name).toBeDefined();
      expect(typeof name).toBe('string');
    });

    it('should get contract symbol', async () => {
      const symbol = await client.symbol();
      expect(symbol).toBeDefined();
      expect(typeof symbol).toBe('string');
    });

    it('should check ERC-721 interface support', async () => {
      const supportsERC721 = await client.supportsERC721();
      expect(typeof supportsERC721).toBe('boolean');
    });
  });

  describe('Client Initialization', () => {
    it('should create client without signer', () => {
      const readOnlyClient = new ERC8004Client(provider, BSC_TESTNET_ADDRESSES);
      expect(readOnlyClient).toBeDefined();
    });

    it('should throw error when trying write operations without signer', async () => {
      const readOnlyClient = new ERC8004Client(provider, BSC_TESTNET_ADDRESSES);
      
      await expect(
        readOnlyClient.register('0x0000000000000000000000000000000000000000', 'ipfs://test')
      ).rejects.toThrow('Signer required');
    });
  });

  describe('EIP-712 Helpers', () => {
    it('should build EIP-712 domain correctly', () => {
      const domain = client.buildReputationEIP712Domain(97, BSC_TESTNET_ADDRESSES.reputation);
      
      expect(domain).toBeDefined();
      expect(domain.name).toBe('ReputationRegistry');
      expect(domain.version).toBe('1');
      expect(domain.chainId).toBe(97);
      expect(domain.verifyingContract).toBe(BSC_TESTNET_ADDRESSES.reputation);
    });
  });
});

// Always run this test to ensure proper env var handling
describe('ERC-8004 Environment Check', () => {
  it('should skip integration tests when BSC_TESTNET_RPC is not set', () => {
    if (!process.env.BSC_TESTNET_RPC) {
      expect(shouldSkip).toBe(true);
      console.log('ℹ️  ERC-8004 integration tests skipped: BSC_TESTNET_RPC not set');
    } else {
      expect(shouldSkip).toBe(false);
      console.log('✓ ERC-8004 integration tests enabled');
    }
  });
});
