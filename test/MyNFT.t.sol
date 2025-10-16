// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {MyNFT} from "../src/MyNFT.sol";

contract MyNFTTest is Test {
    MyNFT public nft;
    address public owner;
    address public user1;
    address public user2;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        nft = new MyNFT(owner);
    }

    function testInitialState() public {
        assertEq(nft.name(), "MyNFT");
        assertEq(nft.symbol(), "MNFT");
        assertEq(nft.totalSupply(), 0);
        assertEq(nft.owner(), owner);
    }

    function testMintSingle() public {
        nft.mint(user1, 1);

        assertEq(nft.totalSupply(), 1);
        assertEq(nft.balanceOf(user1), 1);
        assertEq(nft.ownerOf(1), user1);
    }

    function testMintMultiple() public {
        nft.mint(user1, 5);

        assertEq(nft.totalSupply(), 5);
        assertEq(nft.balanceOf(user1), 5);

        // Check that all tokens are owned by user1
        for (uint256 i = 1; i <= 5; i++) {
            assertEq(nft.ownerOf(i), user1);
        }
    }

    function testMintToMultipleUsers() public {
        nft.mint(user1, 3);
        nft.mint(user2, 2);

        assertEq(nft.totalSupply(), 5);
        assertEq(nft.balanceOf(user1), 3);
        assertEq(nft.balanceOf(user2), 2);

        // Check token ownership
        assertEq(nft.ownerOf(1), user1);
        assertEq(nft.ownerOf(2), user1);
        assertEq(nft.ownerOf(3), user1);
        assertEq(nft.ownerOf(4), user2);
        assertEq(nft.ownerOf(5), user2);
    }

    function testOnlyOwnerCanMint() public {
        vm.prank(user1);
        vm.expectRevert();
        nft.mint(user1, 1);
    }

    function testCannotMintZeroAmount() public {
        vm.expectRevert("Amount must be positive");
        nft.mint(user1, 0);
    }

    function testCannotMintNegativeAmount() public {
        vm.expectRevert("Amount must be positive");
        nft.mint(user1, -1);
    }

    function testLargeMint() public {
        uint256 largeAmount = 100;
        nft.mint(user1, int256(largeAmount));

        assertEq(nft.totalSupply(), largeAmount);
        assertEq(nft.balanceOf(user1), largeAmount);
    }
}
