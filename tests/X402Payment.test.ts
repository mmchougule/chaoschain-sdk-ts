/**
 * X402Payment Tests
 */

import { describe, it, expect } from 'vitest';
import { ethers } from 'ethers';
import { X402PaymentManager } from '../src/X402Payment';

describe('X402PaymentManager', () => {
  const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
  const wallet = new ethers.Wallet(privateKey, provider);

  it('should initialize payment manager', () => {
    const manager = new X402PaymentManager(wallet, provider, 'base-sepolia');
    expect(manager).toBeDefined();
  });

  it('should calculate total cost with fees', () => {
    const manager = new X402PaymentManager(wallet, provider, 'base-sepolia');
    const costs = manager.calculateTotalCost('10.0', 'USDC');

    expect(costs.amount).toBe('10.0');
    expect(parseFloat(costs.fee)).toBeCloseTo(0.25, 2); // 2.5% of 10
    expect(parseFloat(costs.total)).toBeCloseTo(10.25, 2);
  });

  it('should get fee percentage', () => {
    const manager = new X402PaymentManager(wallet, provider, 'base-sepolia');
    expect(manager.getFeePercentage()).toBe(2.5);
  });

  it('should set fee percentage', () => {
    const manager = new X402PaymentManager(wallet, provider, 'base-sepolia');
    manager.setFeePercentage(5.0);
    expect(manager.getFeePercentage()).toBe(5.0);
  });

  it('should throw error for invalid fee percentage', () => {
    const manager = new X402PaymentManager(wallet, provider, 'base-sepolia');
    expect(() => manager.setFeePercentage(-1)).toThrow();
    expect(() => manager.setFeePercentage(101)).toThrow();
  });

  it('should create payment requirements', () => {
    const manager = new X402PaymentManager(wallet, provider, 'base-sepolia');
    const requirements = manager.createPaymentRequirements('5.0', 'USDC', 'Test Service');

    expect(requirements.statusCode).toBe(402);
    expect(requirements.headers['X-Payment-Required']).toBe('x402');
    expect(requirements.body.error).toBe('Payment Required');
    expect(requirements.body.paymentRequired).toBeDefined();
  });

  it('should create payment receipt', () => {
    const manager = new X402PaymentManager(wallet, provider, 'base-sepolia');
    const payment = {
      from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      amount: '10.0',
      currency: 'USDC',
      txHash: '0x1234567890abcdef',
      timestamp: Date.now(),
    };

    const receipt = manager.createReceipt(payment);

    expect(receipt.paymentId).toBeDefined();
    expect(receipt.from).toBe(payment.from);
    expect(receipt.to).toBe(payment.to);
    expect(receipt.amount).toBe(payment.amount);
    expect(receipt.currency).toBe(payment.currency);
  });

  it('should sign and verify receipt', async () => {
    const manager = new X402PaymentManager(wallet, provider, 'base-sepolia');
    const payment = {
      from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      amount: '10.0',
      currency: 'USDC',
      txHash: '0x1234567890abcdef',
      timestamp: Date.now(),
    };

    const receipt = manager.createReceipt(payment);
    const signedReceipt = await manager.signReceipt(receipt);

    expect(signedReceipt.signature).toBeDefined();
    expect(signedReceipt.signature).toMatch(/^0x[a-fA-F0-9]{130}$/);

    const isValid = await manager.verifyReceipt(signedReceipt);
    expect(isValid).toBe(true);
  });
});

