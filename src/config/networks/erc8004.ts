import { NetworkAddresses } from "../../integrations/erc8004";

export const erc8004NetworkMap: { [chainId: number]: NetworkAddresses } = {
  97: {
    chainId: 97,
    name: "bsc-testnet",
    identityRegistry: "0xabbd26d86435b35d9c45177725084ee6a2812e40",
    reputationRegistry: "0xeced1af52a0446275e9e6e4f6f26c99977400a6a",
    validationRegistry: "0x7866bd057f09a4940fe2ce43320518c8749a921e"
  }
};
