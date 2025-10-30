import { ethers } from "ethers";
import IdentityAbi from "./abis/IdentityRegistry.json";
import ReputationAbi from "./abis/ReputationRegistry.json";
import ValidationAbi from "./abis/ValidationRegistry.json";

export type NetworkAddresses = {
  chainId: number;
  name: string;
  identityRegistry: string;
  reputationRegistry: string;
  validationRegistry: string;
};

export const BSC_TESTNET_ADDRESSES: NetworkAddresses = {
  chainId: 97,
  name: "bsc-testnet",
  identityRegistry: "0xabbd26d86435b35d9c45177725084ee6a2812e40",
  reputationRegistry: "0xeced1af52a0446275e9e6e4f6f26c99977400a6a",
  validationRegistry: "0x7866bd057f09a4940fe2ce43320518c8749a921e"
};

export class ERC8004Client {
  provider: ethers.Provider;
  signer?: ethers.Signer;
  addresses: NetworkAddresses;
  identity: any;
  reputation: any;
  validation: any;

  constructor(provider: ethers.Provider | ethers.Signer, addresses: NetworkAddresses = BSC_TESTNET_ADDRESSES) {
    // Check if provider has signTransaction (indicating it's a Signer)
    if ('signTransaction' in provider && typeof (provider as any).signTransaction === 'function') {
      this.signer = provider as ethers.Signer;
      this.provider = (this.signer.provider as ethers.Provider)!;
    } else {
      this.provider = provider as ethers.Provider;
    }
    this.addresses = addresses;
    const ifaceProviderOrSigner = this.signer ?? this.provider;
    this.identity = new ethers.Contract(addresses.identityRegistry, IdentityAbi as any, ifaceProviderOrSigner);
    this.reputation = new ethers.Contract(addresses.reputationRegistry, ReputationAbi as any, ifaceProviderOrSigner);
    this.validation = new ethers.Contract(addresses.validationRegistry, ValidationAbi as any, ifaceProviderOrSigner);
  }

  connect(signer: ethers.Signer) {
    this.signer = signer;
    this.identity = this.identity.connect(signer);
    this.reputation = this.reputation.connect(signer);
    this.validation = this.validation.connect(signer);
    return this;
  }

  async name(): Promise<string> {
    return this.identity.name();
  }
  async symbol(): Promise<string> {
    return this.identity.symbol();
  }
  async supportsERC721(): Promise<boolean> {
    return this.identity.supportsInterface("0x80ac58cd");
  }
  async register(to: string, metadataUri: string, overrides?: ethers.Overrides) {
    if (!this.signer) throw new Error("Signer required for register");
    return this.identity.register(to, metadataUri, overrides || {});
  }
  async setMetadata(agentId: ethers.BigNumberish, key: string, value: string) {
    if (!this.signer) throw new Error("Signer required for setMetadata");
    return this.identity.setMetadata(agentId, key, value);
  }
  async getMetadata(agentId: ethers.BigNumberish, key: string): Promise<string> {
    return this.identity.getMetadata(agentId, key);
  }
  async ownerOf(tokenId: ethers.BigNumberish): Promise<string> {
    return this.identity.ownerOf(tokenId);
  }

  async giveFeedback(
    agentId: ethers.BigNumberish,
    score: number,
    tags: string[],
    uri: string,
    hash: string,
    auth: string,
    overrides?: ethers.Overrides
  ) {
    if (!this.signer) throw new Error("Signer required for giveFeedback");
    return this.reputation.giveFeedback(agentId, score, tags, uri, hash, auth, overrides || {});
  }

  async getFeedbackSummary(agentId: ethers.BigNumberish) {
    return this.reputation.getFeedbackSummary(agentId);
  }

  async revokeFeedback(overrides?: ethers.Overrides) {
    if (!this.signer) throw new Error("Signer required for revokeFeedback");
    return this.reputation.revokeFeedback(overrides || {});
  }

  async submitValidation(agentId: ethers.BigNumberish, proofUri: string) {
    if (!this.signer) throw new Error("Signer required for submitValidation");
    return this.validation.submitValidation(agentId, proofUri);
  }
  async getValidations(agentId: ethers.BigNumberish) {
    return this.validation.getValidations(agentId);
  }

  buildReputationEIP712(domainName = "ReputationRegistry", domainVersion = "1.0.0") {
    const domain = {
      name: domainName,
      version: domainVersion,
      chainId: this.addresses.chainId,
      verifyingContract: this.addresses.reputationRegistry
    };

    const types = {
      Feedback: [
        { name: "agentId", type: "uint256" },
        { name: "score", type: "uint8" },
        { name: "tags", type: "string[]" },
        { name: "uri", type: "string" },
        { name: "hash", type: "bytes32" },
        { name: "nonce", type: "uint256" },
        { name: "expiry", type: "uint256" }
      ]
    };

    return { domain, types };
  }

  async signFeedbackAuth(signer: ethers.Signer, signPayload: any) {
    const { domain, types } = this.buildReputationEIP712();
    const signature = await signer.signTypedData(domain as any, types as any, signPayload);
    return signature;
  }
}
