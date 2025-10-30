/**
 * ERC-8004 Integration Client
 * Provides wrapper methods for interacting with ERC-8004 contracts
 */

import { ethers } from 'ethers';
import IdentityRegistryABI from './abis/IdentityRegistry.json';
import ReputationRegistryABI from './abis/ReputationRegistry.json';
import ValidationRegistryABI from './abis/ValidationRegistry.json';

/**
 * BSC Testnet contract addresses (chainId 97)
 * These addresses should be replaced with actual deployed contract addresses
 */
export const BSC_TESTNET_ADDRESSES = {
  identity: '0x0000000000000000000000000000000000000000',
  reputation: '0x0000000000000000000000000000000000000000',
  validation: '0x0000000000000000000000000000000000000000',
};

/**
 * EIP-712 Domain for reputation feedback
 */
export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

/**
 * Reputation feedback parameters
 */
export interface ReputationFeedback {
  agentId: bigint;
  score: number;
  tags: string[];
  uri: string;
  hash: string;
}

/**
 * ERC-8004 Client for BSC Testnet
 */
export class ERC8004Client {
  private identityContract: ethers.Contract;
  private reputationContract: ethers.Contract;
  private validationContract: ethers.Contract;
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  /**
   * Create a new ERC8004Client instance
   * @param provider - Ethers provider
   * @param addresses - Contract addresses (defaults to BSC_TESTNET_ADDRESSES)
   * @param signer - Optional signer for write operations
   */
  constructor(
    provider: ethers.Provider,
    addresses = BSC_TESTNET_ADDRESSES,
    signer?: ethers.Signer
  ) {
    this.provider = provider;
    this.signer = signer;

    // Initialize read-only contracts
    this.identityContract = new ethers.Contract(
      addresses.identity,
      IdentityRegistryABI,
      provider
    );
    this.reputationContract = new ethers.Contract(
      addresses.reputation,
      ReputationRegistryABI,
      provider
    );
    this.validationContract = new ethers.Contract(
      addresses.validation,
      ValidationRegistryABI,
      provider
    );

    // Connect signer if provided
    if (signer) {
      this.identityContract = this.identityContract.connect(signer);
      this.reputationContract = this.reputationContract.connect(signer);
      this.validationContract = this.validationContract.connect(signer);
    }
  }

  // ===== Identity Registry Methods =====

  /**
   * Get the name of the identity registry
   */
  async name(): Promise<string> {
    return this.identityContract.name();
  }

  /**
   * Get the symbol of the identity registry
   */
  async symbol(): Promise<string> {
    return this.identityContract.symbol();
  }

  /**
   * Check if contract supports ERC-721 interface
   */
  async supportsERC721(): Promise<boolean> {
    // ERC-721 interface ID: 0x80ac58cd
    const erc721InterfaceId = '0x80ac58cd';
    return this.identityContract.supportsInterface(erc721InterfaceId);
  }

  /**
   * Register a new agent identity
   * @param to - Address to register the identity to
   * @param uri - Metadata URI for the agent
   */
  async register(to: string, uri: string): Promise<bigint> {
    if (!this.signer) {
      throw new Error('Signer required for register operation');
    }
    const tx = await this.identityContract.register(to, uri);
    const receipt = await tx.wait();
    
    // Extract agentId from event logs
    // This is a simplified version - in production you'd parse the actual event
    return BigInt(receipt.logs[0].topics[1]);
  }

  /**
   * Set metadata for an agent
   * @param agentId - Agent ID
   * @param key - Metadata key
   * @param value - Metadata value
   */
  async setMetadata(agentId: bigint, key: string, value: string): Promise<void> {
    if (!this.signer) {
      throw new Error('Signer required for setMetadata operation');
    }
    const tx = await this.identityContract.setMetadata(agentId, key, value);
    await tx.wait();
  }

  /**
   * Get metadata for an agent
   * @param agentId - Agent ID
   * @param key - Metadata key
   */
  async getMetadata(agentId: bigint, key: string): Promise<string> {
    return this.identityContract.getMetadata(agentId, key);
  }

  /**
   * Get owner of an agent identity
   * @param agentId - Agent ID
   */
  async ownerOf(agentId: bigint): Promise<string> {
    return this.identityContract.ownerOf(agentId);
  }

  // ===== Reputation Registry Methods =====

  /**
   * Give feedback to an agent
   * @param agentId - Agent ID to give feedback to
   * @param score - Feedback score (0-255)
   * @param tags - Feedback tags
   * @param uri - Feedback URI
   * @param hash - Feedback content hash
   * @param auth - EIP-712 signature
   */
  async giveFeedback(
    agentId: bigint,
    score: number,
    tags: string[],
    uri: string,
    hash: string,
    auth: string
  ): Promise<void> {
    if (!this.signer) {
      throw new Error('Signer required for giveFeedback operation');
    }
    const tx = await this.reputationContract.giveFeedback(
      agentId,
      score,
      tags,
      uri,
      hash,
      auth
    );
    await tx.wait();
  }

  /**
   * Get feedback summary for an agent
   * @param agentId - Agent ID
   */
  async getFeedbackSummary(agentId: bigint): Promise<{ count: bigint; avgScore: bigint }> {
    const result = await this.reputationContract.getFeedbackSummary(agentId);
    return {
      count: result.count,
      avgScore: result.avgScore,
    };
  }

  /**
   * Revoke feedback
   */
  async revokeFeedback(): Promise<void> {
    if (!this.signer) {
      throw new Error('Signer required for revokeFeedback operation');
    }
    const tx = await this.reputationContract.revokeFeedback();
    await tx.wait();
  }

  // ===== Validation Registry Methods =====

  /**
   * Submit a validation proof
   * @param agentId - Agent ID
   * @param proofUri - Proof URI
   */
  async submitValidation(agentId: bigint, proofUri: string): Promise<void> {
    if (!this.signer) {
      throw new Error('Signer required for submitValidation operation');
    }
    const tx = await this.validationContract.submitValidation(agentId, proofUri);
    await tx.wait();
  }

  /**
   * Get validations for an agent
   * @param agentId - Agent ID
   */
  async getValidations(agentId: bigint): Promise<bigint[]> {
    return this.validationContract.getValidations(agentId);
  }

  // ===== EIP-712 Helper Methods =====

  /**
   * Build EIP-712 domain for reputation feedback
   * @param chainId - Chain ID
   * @param verifyingContract - Reputation contract address
   */
  buildReputationEIP712Domain(
    chainId: number,
    verifyingContract: string
  ): EIP712Domain {
    return {
      name: 'ReputationRegistry',
      version: '1',
      chainId,
      verifyingContract,
    };
  }

  /**
   * Sign feedback authorization using EIP-712
   * @param signer - Ethers signer
   * @param feedback - Feedback parameters
   * @param domain - EIP-712 domain
   */
  async signFeedbackAuth(
    signer: ethers.Signer,
    feedback: ReputationFeedback,
    domain: EIP712Domain
  ): Promise<string> {
    const types = {
      Feedback: [
        { name: 'agentId', type: 'uint256' },
        { name: 'score', type: 'uint8' },
        { name: 'tags', type: 'string[]' },
        { name: 'uri', type: 'string' },
        { name: 'hash', type: 'bytes32' },
      ],
    };

    const value = {
      agentId: feedback.agentId,
      score: feedback.score,
      tags: feedback.tags,
      uri: feedback.uri,
      hash: feedback.hash,
    };

    return signer.signTypedData(domain, types, value);
  }
}
