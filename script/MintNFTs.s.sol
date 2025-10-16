// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MyNFT} from "../src/MyNFT.sol";

contract MintNFTsScript is Script {
    function setUp() public {}

    function run() public {
        // Get environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Get contract address and mint amount from environment or use defaults
        address contractAddress = vm.envOr("CONTRACT_ADDRESS", address(0));
        uint256 mintAmount = vm.envOr("MINT_AMOUNT", uint256(1));
        address mintTo = vm.envOr("MINT_TO", deployer);

        require(
            contractAddress != address(0),
            "CONTRACT_ADDRESS must be set in .env file"
        );
        require(mintAmount > 0, "MINT_AMOUNT must be greater than 0");

        console.log("=== Minting NFTs ===");
        console.log("Contract Address:", contractAddress);
        console.log("Minting to:", mintTo);
        console.log("Amount to mint:", mintAmount);
        console.log("Caller:", deployer);

        // Connect to the existing contract
        MyNFT nft = MyNFT(contractAddress);

        // Check contract details before minting
        console.log("\n=== Contract Info ===");
        console.log("Contract Name:", nft.name());
        console.log("Contract Symbol:", nft.symbol());
        console.log("Current Total Supply:", nft.totalSupply());
        console.log("Current Balance of recipient:", nft.balanceOf(mintTo));
        console.log("Contract Owner:", nft.owner());

        // Mint the NFTs
        vm.startBroadcast(deployerPrivateKey);
        nft.mint(mintTo, int256(mintAmount));
        vm.stopBroadcast();

        console.log("\n=== Minting Complete ===");
        console.log("Successfully minted", mintAmount, "NFTs");
        console.log("New Total Supply:", nft.totalSupply());
        console.log("New Balance of recipient:", nft.balanceOf(mintTo));
    }
}
