// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

/**
 * @author Oscar W arrieta
 * @title DAppToken
 * @notice ERC20 token contract with minting capability. 
 */

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract DAppToken is ERC20, Ownable {
    constructor(
        address initialOwner
    ) ERC20("DApp Token", "DAPP") Ownable(initialOwner) {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
