import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MinimalContract = buildModule("MinimalContract", (m) => {
  const contract = m.contract("MinimalContract");
  return { contract };
});

export default MinimalContract;

