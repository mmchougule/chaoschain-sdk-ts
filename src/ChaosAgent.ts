/**
 * ChaosAgent - ERC-8004 v1.0 Contract Interactions
 * Handles Identity, Reputation, and Validation Registry interactions
 */

import { ethers } from 'ethers';
import {
  AgentMetadata,
  AgentRegistration,
  FeedbackParams,
  FeedbackRecord,
  ValidationRequestParams,
  ValidationRequest,
  ValidationStatus,
  ContractAddresses,
  TransactionResult,
} from './types';
import {
  IDENTITY_REGISTRY_ABI,
  REPUTATION_REGISTRY_ABI,
  VALIDATION_REGISTRY_ABI,
} from './utils/contracts';

export class ChaosAgent {
  private identityContract: ethers.Contract;
  private reputationContract: ethers.Contract;
  private validationContract: ethers.Contract;
  private signer: ethers.Signer;

  constructor(
    addresses: ContractAddresses,
    signer: ethers.Signer,
    _provider: ethers.Provider
  ) {
    this.signer = signer;

    // Initialize contract instances
    this.identityContract = new ethers.Contract(
      addresses.identity,
      IDENTITY_REGISTRY_ABI,
      signer
    );
    this.reputationContract = new ethers.Contract(
      addresses.reputation,
      REPUTATION_REGISTRY_ABI,
      signer
    );
    this.validationContract = new ethers.Contract(
      addresses.validation,
      VALIDATION_REGISTRY_ABI,
      signer
    );
  }

  // ============================================================================
  // Identity Registry Methods
  // ============================================================================

  /**
   * Register a new agent identity (ERC-8004)
   */
  async registerIdentity(metadata?: AgentMetadata): Promise<AgentRegistration> {
    // Create metadata URI (JSON)
    const uri = metadata ? `data:application/json,${JSON.stringify(metadata)}` : '';

    // Call registerAgent
    const tx = await this.identityContract.registerAgent(uri);
    const receipt = await tx.wait();

    // Parse AgentRegistered event
    const event = receipt.logs
      .map((log: ethers.Log) => {
        try {
          return this.identityContract.interface.parseLog({
            topics: [...log.topics],
            data: log.data,
          });
        } catch {
          return null;
        }
      })
      .find((e: ethers.LogDescription | null) => e?.name === 'AgentRegistered');

    if (!event) {
      throw new Error('AgentRegistered event not found');
    }

    return {
      agentId: event.args.agentId,
      txHash: receipt.hash,
      owner: event.args.owner,
    };
  }

  /**
   * Get agent metadata
   */
  async getAgentMetadata(agentId: bigint): Promise<AgentMetadata | null> {
    try {
      const uri = await this.identityContract.getAgentURI(agentId);
      
      if (!uri) {
        return null;
      }

      // Parse data URI
      if (uri.startsWith('data:application/json,')) {
        const json = uri.substring('data:application/json,'.length);
        return JSON.parse(decodeURIComponent(json));
      }

      // Parse ipfs:// URI (fetch from gateway)
      if (uri.startsWith('ipfs://')) {
        const cid = uri.substring(7);
        const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
        return response.json();
      }

      // Parse https:// URI
      if (uri.startsWith('https://') || uri.startsWith('http://')) {
        const response = await fetch(uri);
        return response.json();
      }

      return null;
    } catch (error) {
      console.error('Failed to get agent metadata:', error);
      return null;
    }
  }

  /**
   * Set agent URI
   */
  async setAgentUri(agentId: bigint, uri: string): Promise<string> {
    const tx = await this.identityContract.setAgentURI(agentId, uri);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Update agent metadata
   */
  async updateAgentMetadata(agentId: bigint, metadata: AgentMetadata): Promise<string> {
    const uri = `data:application/json,${JSON.stringify(metadata)}`;
    return this.setAgentUri(agentId, uri);
  }

  /**
   * Check if agent exists
   */
  async agentExists(agentId: bigint): Promise<boolean> {
    return this.identityContract.agentExists(agentId);
  }

  /**
   * Get agent owner
   */
  async getAgentOwner(agentId: bigint): Promise<string> {
    return this.identityContract.ownerOf(agentId);
  }

  /**
   * Get total number of agents
   */
  async getTotalAgents(): Promise<bigint> {
    return this.identityContract.totalAgents();
  }

  /**
   * Transfer agent ownership
   */
  async transferAgent(agentId: bigint, to: string): Promise<string> {
    const from = await this.signer.getAddress();
    const tx = await this.identityContract.transferFrom(from, to, agentId);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  // ============================================================================
  // Reputation Registry Methods
  // ============================================================================

  /**
   * Generate EIP-191 signed feedback authorization (ERC-8004 v1.0)
   * 
   * This signature allows a client to submit feedback to an agent's reputation.
   * The agent owner signs to authorize the client to give feedback up to a certain index.
   * 
   * @param agentId Target agent ID receiving feedback
   * @param clientAddress Address of the client giving feedback
   * @param indexLimit Maximum feedback index this authorization permits
   * @param expiry Unix timestamp when authorization expires
   * @returns Signed feedbackAuth bytes for use in giveFeedback()
   */
  async generateFeedbackAuthorization(
    agentId: bigint,
    clientAddress: string,
    indexLimit: bigint,
    expiry: bigint
  ): Promise<string> {
    try {
      // Get chain ID
      const network = await this.signer.provider!.getNetwork();
      const chainId = network.chainId;

      // Get identity registry address
      const identityAddress = await this.identityContract.getAddress();

      // Get signer address
      const signerAddress = await this.signer.getAddress();

      // Pack the FeedbackAuth struct (7 fields)
      // As per ERC-8004 v1.0 spec: (agentId, clientAddress, indexLimit, expiry, chainId, identityRegistry, signerAddress)
      const feedbackAuthData = ethers.solidityPackedKeccak256(
        ['uint256', 'address', 'uint64', 'uint256', 'uint256', 'address', 'address'],
        [agentId, clientAddress, indexLimit, expiry, chainId, identityAddress, signerAddress]
      );

      // Sign with agent's private key (EIP-191)
      const signature = await this.signer.signMessage(ethers.getBytes(feedbackAuthData));
      const signatureBytes = ethers.getBytes(signature); // 65 bytes (r + s + v)

      // Pack struct data + signature (224 bytes + 65 bytes = 289 bytes)
      const structBytes = ethers.concat([
        ethers.toBeHex(agentId, 32),
        ethers.zeroPadValue(clientAddress, 32),
        ethers.concat([ethers.toBeHex(indexLimit, 8), ethers.zeroPadValue('0x', 24)]), // uint64 padded
        ethers.toBeHex(expiry, 32),
        ethers.toBeHex(chainId, 32),
        ethers.zeroPadValue(identityAddress, 32),
        ethers.zeroPadValue(signerAddress, 32)
      ]);

      // Return struct + signature
      const feedbackAuth = ethers.hexlify(ethers.concat([structBytes, signatureBytes]));

      console.log(`✅ Generated feedback authorization for agent #${agentId}`);
      return feedbackAuth;
    } catch (e: any) {
      throw new Error(`Failed to generate feedback authorization: ${e.message}`);
    }
  }

  /**
   * Give feedback to an agent
   */
  async giveFeedback(params: FeedbackParams): Promise<string> {
    const { agentId, rating, feedbackUri } = params;

    // Validate rating (0-100)
    if (rating < 0 || rating > 100) {
      throw new Error('Rating must be between 0 and 100');
    }

    const tx = await this.reputationContract.giveFeedback(agentId, rating, feedbackUri);
    const receipt = await tx.wait();

    return receipt.hash;
  }

  /**
   * Revoke feedback
   */
  async revokeFeedback(feedbackId: bigint): Promise<string> {
    const tx = await this.reputationContract.revokeFeedback(feedbackId);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Append response to feedback
   */
  async appendResponse(feedbackId: bigint, responseUri: string): Promise<string> {
    const tx = await this.reputationContract.appendResponse(feedbackId, responseUri);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Get feedback details
   */
  async getFeedback(feedbackId: bigint): Promise<FeedbackRecord> {
    const feedback = await this.reputationContract.getFeedback(feedbackId);
    
    return {
      feedbackId: feedback.feedbackId,
      fromAgent: feedback.fromAgent,
      toAgent: feedback.toAgent,
      rating: feedback.rating,
      feedbackUri: feedback.feedbackURI,
      timestamp: Number(feedback.timestamp),
      revoked: feedback.revoked,
    };
  }

  /**
   * Get agent feedback IDs
   */
  async getAgentFeedback(
    agentId: bigint,
    offset: number = 0,
    limit: number = 10
  ): Promise<bigint[]> {
    return this.reputationContract.getAgentFeedback(agentId, offset, limit);
  }

  /**
   * Get agent reputation stats
   */
  async getAgentStats(agentId: bigint): Promise<{
    totalFeedback: bigint;
    averageRating: bigint;
    totalRevoked: bigint;
  }> {
    return this.reputationContract.getAgentStats(agentId);
  }

  // ============================================================================
  // Validation Registry Methods
  // ============================================================================

  /**
   * Request validation from another agent
   */
  async requestValidation(params: ValidationRequestParams): Promise<string> {
    const { validatorAgentId, requestUri, requestHash } = params;

    // Convert hash to bytes32
    const hashBytes = ethers.id(requestHash);

    const tx = await this.validationContract.requestValidation(
      validatorAgentId,
      requestUri,
      hashBytes
    );
    const receipt = await tx.wait();

    return receipt.hash;
  }

  /**
   * Respond to validation request
   */
  async respondToValidation(
    requestId: bigint,
    approved: boolean,
    responseUri: string
  ): Promise<string> {
    const tx = await this.validationContract.respondToValidation(
      requestId,
      approved,
      responseUri
    );
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Get validation request details
   */
  async getValidationRequest(requestId: bigint): Promise<ValidationRequest> {
    const request = await this.validationContract.getValidationRequest(requestId);

    return {
      requestId: request.requestId,
      requester: request.requester,
      validator: request.validator,
      requestUri: request.requestURI,
      requestHash: request.requestHash,
      status: request.status as ValidationStatus,
      responseUri: request.responseURI,
      timestamp: Number(request.timestamp),
    };
  }

  /**
   * Get agent validation requests
   */
  async getAgentValidationRequests(
    agentId: bigint,
    asValidator: boolean = false,
    offset: number = 0,
    limit: number = 10
  ): Promise<bigint[]> {
    return this.validationContract.getAgentValidationRequests(
      agentId,
      asValidator,
      offset,
      limit
    );
  }

  /**
   * Get validation statistics for an agent
   */
  async getValidationStats(agentId: bigint): Promise<{
    totalRequested: bigint;
    totalValidated: bigint;
    totalApproved: bigint;
    totalRejected: bigint;
  }> {
    return this.validationContract.getValidationStats(agentId);
  }

  // ============================================================================
  // Event Listening
  // ============================================================================

  /**
   * Listen for AgentRegistered events
   */
  onAgentRegistered(callback: (agentId: bigint, owner: string, uri: string) => void): void {
    this.identityContract.on('AgentRegistered', callback);
  }

  /**
   * Listen for FeedbackGiven events
   */
  onFeedbackGiven(
    callback: (feedbackId: bigint, fromAgent: bigint, toAgent: bigint, rating: number) => void
  ): void {
    this.reputationContract.on('FeedbackGiven', callback);
  }

  /**
   * Listen for ValidationRequested events
   */
  onValidationRequested(
    callback: (requestId: bigint, requester: bigint, validator: bigint) => void
  ): void {
    this.validationContract.on('ValidationRequested', callback);
  }

  /**
   * Listen for ValidationResponded events
   */
  onValidationResponded(
    callback: (requestId: bigint, approved: boolean, responseUri: string) => void
  ): void {
    this.validationContract.on('ValidationResponded', callback);
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(): void {
    this.identityContract.removeAllListeners();
    this.reputationContract.removeAllListeners();
    this.validationContract.removeAllListeners();
  }
}

