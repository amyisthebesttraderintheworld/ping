// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Treasury is Ownable {
    uint256 public feePercentage = 5; // 0.5% (assuming basis points 50/10000)
    uint256 public constant BASIS_POINTS = 10000;

    event FeeCollected(uint256 amount);
    event BurnExecuted(uint256 amount);

    constructor() Ownable(msg.sender) {}

    receive() external payable {
        emit FeeCollected(msg.value);
    }

    function setFeePercentage(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee too high"); // Max 10%
        feePercentage = _fee;
    }

    function withdraw(address payable recipient, uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");
    }

    function executeBurn(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        // Simplified burn: sending to 0x0 (not actual burning of native ETH, but protocol removal)
        (bool success, ) = payable(address(0)).call{value: amount}("");
        require(success, "Burn failed");
        emit BurnExecuted(amount);
    }
}
