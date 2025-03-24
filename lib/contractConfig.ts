// Contract ABIs
export const HatchTokenABI = [
  "function merkleRoot() external view returns (bytes32)",
  "function updateMerkleRoot(bytes32 newRoot) external",
  "function claimTokens(uint256 totalAllocation, bytes32[] calldata merkleProof) external",
  "function getUnlockedBalance(address account) external view returns (uint256)",
  "function userTotalClaimed(address) external view returns (uint256)"
];

// BNB Smart Chain testnet has chain ID 97
export const contractAddresses: Record<number, string> = {
  // We're only using BNB testnet for this project
  97: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_TESTNET || '0x381D7b174ae75B98F189eF26052a97BABDEDd263'
}; 