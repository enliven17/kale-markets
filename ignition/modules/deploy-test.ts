import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TestContract = buildModule("TestContract", (m) => {
  const contract = m.contract("TestContract");
  return { contract };
});

export default TestContract;

