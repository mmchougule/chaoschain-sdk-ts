/**
 * ERC-8004 contract addresses for BSC Testnet (chainId 97)
 */

export interface ERC8004Addresses {
  identity: string;
  reputation: string;
  validation: string;
}

/**
 * Contract addresses from deployment verification report
 * Note: Replace with actual deployed addresses once available
 */
export const BSC_TESTNET_ERC8004: Record<number, ERC8004Addresses> = {
  97: {
    identity: '0x0000000000000000000000000000000000000000',
    reputation: '0x0000000000000000000000000000000000000000',
    validation: '0x0000000000000000000000000000000000000000',
  },
};

/**
 * Get ERC-8004 addresses for a specific chain
 * @param chainId - Chain ID (97 for BSC Testnet)
 */
export function getERC8004Addresses(chainId: number): ERC8004Addresses {
  const addresses = BSC_TESTNET_ERC8004[chainId];
  if (!addresses) {
    throw new Error(`No ERC-8004 addresses configured for chainId ${chainId}`);
  }
  return addresses;
}
