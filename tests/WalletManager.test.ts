/**
 * WalletManager Tests
 */

import { describe, it, expect } from 'vitest';
import { WalletManager } from '../src/WalletManager';

describe('WalletManager', () => {
  it('should create a random wallet', () => {
    const wallet = WalletManager.createRandom();
    expect(wallet).toBeDefined();
    expect(wallet.getAddress()).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it('should create wallet from private key', () => {
    const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const wallet = WalletManager.fromPrivateKey(privateKey);
    expect(wallet.getAddress()).toBe('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  });

  it('should create wallet from mnemonic', () => {
    const mnemonic = 'test test test test test test test test test test test junk';
    const wallet = WalletManager.fromMnemonic(mnemonic);
    expect(wallet).toBeDefined();
    expect(wallet.getAddress()).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it('should validate private key', () => {
    const validKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const invalidKey = 'invalid';
    
    expect(WalletManager.isValidPrivateKey(validKey)).toBe(true);
    expect(WalletManager.isValidPrivateKey(invalidKey)).toBe(false);
  });

  it('should validate mnemonic', () => {
    const validMnemonic = 'test test test test test test test test test test test junk';
    const invalidMnemonic = 'invalid mnemonic phrase';
    
    expect(WalletManager.isValidMnemonic(validMnemonic)).toBe(true);
    expect(WalletManager.isValidMnemonic(invalidMnemonic)).toBe(false);
  });

  it('should generate new mnemonic', () => {
    const mnemonic = WalletManager.generateMnemonic();
    expect(mnemonic).toBeDefined();
    expect(mnemonic.split(' ')).toHaveLength(12);
    expect(WalletManager.isValidMnemonic(mnemonic)).toBe(true);
  });

  it('should sign message', async () => {
    const wallet = WalletManager.createRandom();
    const message = 'Hello ChaosChain!';
    const signature = await wallet.signMessage(message);
    
    expect(signature).toBeDefined();
    expect(signature).toMatch(/^0x[a-fA-F0-9]{130}$/);
  });

  it('should get wallet properties', () => {
    const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const wallet = WalletManager.fromPrivateKey(privateKey);
    
    expect(wallet.getAddress()).toBe('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    expect(wallet.getPrivateKey()).toBe(privateKey);
    expect(wallet.getWallet()).toBeDefined();
  });
});

