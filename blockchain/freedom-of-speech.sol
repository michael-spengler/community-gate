// SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE Version 3
pragma solidity 0.8.19;
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.4/contracts/token/ERC20/IERC20.sol";
import "https://github.com/monique-baumann/freedom-cash/blob/v1.3.0/blockchain/freedom-cash-interface.sol";

contract FreedomOfSpeech {

    uint256 public speechCounter;
    mapping(uint256 => ISpeech) public speeches;
    struct ISpeech {
        address from;
        string text;
		uint256 refersTo;
        uint256 donations;
        uint256 claimed; 
        uint256 timestamp;
    }
    address public freedomCashSmartContract = 0x1E7A208810366D0562c7Ba93F883daEedBf31410;

    error ReferenceSeemsUnintended();
    error NothingToClaimATM();

    function speak(string memory text, uint256 refersTo) public {
		if(refersTo > speechCounter) { revert ReferenceSeemsUnintended(); }
        speechCounter++;
        speeches[speechCounter]  = ISpeech(msg.sender, text, refersTo, 0, 0, block.timestamp);
    }
    function appreciateSpeech(uint256 speechID, uint256 donationAmountFC, uint256 fCBuyPrice) public payable {
        if(speechID > speechCounter) { revert ReferenceSeemsUnintended(); }        
        IFreedomCash(freedomCashSmartContract).buyFreedomCash{value: msg.value}(donationAmountFC, fCBuyPrice);
		speeches[speechID].donations += donationAmountFC;
    }
    function claimDonations() public {
        uint256 sum;
        for (uint256 i = 1; i <= speechCounter; i++) {
            if (msg.sender == speeches[i].from) { 
                uint256 claimable =  speeches[i].donations -  speeches[i].claimed;
                speeches[i].claimed += claimable;
                sum += claimable;
            }
        }
        if (sum == 0) { revert NothingToClaimATM(); }
        IERC20(freedomCashSmartContract).transfer(msg.sender, sum);
    }
}