import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SimpleSomniaMarket = buildModule("SimpleSomniaMarket", (m) => {
  const contract = m.contract("SimpleSomniaMarket");
  return { contract };
});

export default SimpleSomniaMarket;


