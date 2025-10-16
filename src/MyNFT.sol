// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    constructor(
        address initialOwner
    ) ERC721("MyNFT", "MNFT") Ownable(initialOwner) {
        _nextTokenId = 1;
    }

    function mint(address to, int256 amount) public onlyOwner {
        require(amount > 0, "Amount must be positive");

        uint256 uAmount = uint256(amount);
        for (uint256 i = 0; i < uAmount; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(to, tokenId);
        }
    }

    function totalSupply() public view returns (uint256) {
        return _nextTokenId - 1;
    }
}
