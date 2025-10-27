/**
 * ChaosChainSDK Core Tests
 */

import { describe, it, expect } from 'vitest';
import { ChaosChainSDK, NetworkConfig, AgentRole } from '../src';

describe('ChaosChainSDK', () => {
  it('should initialize with minimal config', () => {
    const sdk = new ChaosChainSDK({
      agentName: 'TestAgent',
      agentDomain: 'test.example.com',
      agentRole: AgentRole.SERVER,
      network: NetworkConfig.BASE_SEPOLIA,
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    });

    expect(sdk).toBeDefined();
    expect(sdk.agentName).toBe('TestAgent');
    expect(sdk.agentDomain).toBe('test.example.com');
    expect(sdk.agentRole).toBe(AgentRole.SERVER);
    expect(sdk.network).toBe(NetworkConfig.BASE_SEPOLIA);
  });

  it('should get wallet address', () => {
    const sdk = new ChaosChainSDK({
      agentName: 'TestAgent',
      agentDomain: 'test.example.com',
      agentRole: AgentRole.SERVER,
      network: NetworkConfig.BASE_SEPOLIA,
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    });

    const address = sdk.getAddress();
    expect(address).toBe('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  });

  it('should have storage provider', () => {
    const sdk = new ChaosChainSDK({
      agentName: 'TestAgent',
      agentDomain: 'test.example.com',
      agentRole: AgentRole.SERVER,
      network: NetworkConfig.BASE_SEPOLIA,
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    });

    expect(sdk.storage).toBeDefined();
    expect(sdk.storage.upload).toBeDefined();
    expect(sdk.storage.download).toBeDefined();
  });

  it('should get network info', () => {
    const sdk = new ChaosChainSDK({
      agentName: 'TestAgent',
      agentDomain: 'test.example.com',
      agentRole: AgentRole.SERVER,
      network: NetworkConfig.BASE_SEPOLIA,
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    });

    expect(sdk.networkInfo).toBeDefined();
    expect(sdk.networkInfo.chainId).toBe(84532);
    expect(sdk.networkInfo.contracts.identity).toBe('0x8004AA63c570c570eBF15376c0dB199918BFe9Fb');
  });

  it('should get provider', () => {
    const sdk = new ChaosChainSDK({
      agentName: 'TestAgent',
      agentDomain: 'test.example.com',
      agentRole: AgentRole.SERVER,
      network: NetworkConfig.BASE_SEPOLIA,
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    });

    const provider = sdk.getProvider();
    expect(provider).toBeDefined();
  });

  it('should have payment manager when enabled', () => {
    const sdk = new ChaosChainSDK({
      agentName: 'TestAgent',
      agentDomain: 'test.example.com',
      agentRole: AgentRole.SERVER,
      network: NetworkConfig.BASE_SEPOLIA,
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      enablePayments: true,
    });

    expect(() => sdk.calculateTotalCost('10.0', 'USDC')).not.toThrow();
  });

  it('should throw when payment manager disabled', () => {
    const sdk = new ChaosChainSDK({
      agentName: 'TestAgent',
      agentDomain: 'test.example.com',
      agentRole: AgentRole.SERVER,
      network: NetworkConfig.BASE_SEPOLIA,
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      enablePayments: false,
    });

    expect(() => sdk.calculateTotalCost('10.0', 'USDC')).toThrow();
  });

  it('should get SDK version', () => {
    const version = ChaosChainSDK.getVersion();
    expect(version).toBe('0.1.0');
  });

  it('should get supported networks', () => {
    const networks = ChaosChainSDK.getSupportedNetworks();
    expect(networks).toContain('base-sepolia');
    expect(networks).toContain('ethereum-sepolia');
    expect(networks.length).toBeGreaterThan(0);
  });

  it('should sign message', async () => {
    const sdk = new ChaosChainSDK({
      agentName: 'TestAgent',
      agentDomain: 'test.example.com',
      agentRole: AgentRole.SERVER,
      network: NetworkConfig.BASE_SEPOLIA,
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    });

    const message = 'Hello ChaosChain!';
    const signature = await sdk.signMessage(message);
    
    expect(signature).toBeDefined();
    expect(signature).toMatch(/^0x[a-fA-F0-9]{130}$/);
  });
});

