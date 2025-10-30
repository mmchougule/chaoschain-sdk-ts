import { ethers } from "ethers";
import { ERC8004Client, BSC_TESTNET_ADDRESSES } from "../../src/integrations/erc8004";

describe("ERC8004 integration (BSC Testnet)", () => {
  const rpc = process.env.BSC_TESTNET_RPC;
  if (!rpc) {
    test.skip("BSC_TESTNET_RPC not set, skipping integration tests", () => {});
    return;
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const client = new ERC8004Client(provider, BSC_TESTNET_ADDRESSES);

  test("read identity name/symbol and supports ERC721", async () => {
    const name = await client.name();
    const symbol = await client.symbol();
    const supports = await client.supportsERC721();
    expect(name).toBeDefined();
    expect(symbol).toBeDefined();
    expect(supports).toBe(true);
  });
});
