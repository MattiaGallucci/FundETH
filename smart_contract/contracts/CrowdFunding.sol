// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CrowdFunding {
    
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
    }

    mapping(uint256 => Campaign) public campaigns;

    uint256 public numberOfCampaigns = 0;

    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        // GuardCheck
        require(_deadline > block.timestamp, "La scadenza deve essere nel futuro");
        
        Campaign storage campaign = campaigns[numberOfCampaigns];

        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;

        numberOfCampaigns++;

        return numberOfCampaigns - 1;
    }

    function donateToCampaign(uint256 _id) public payable {
        uint256 amount = msg.value;

        Campaign storage campaign = campaigns[_id];

        //GUardCheck
        require(block.timestamp < campaign.deadline, "La campagna e' scaduta");

        campaign.amountCollected = campaign.amountCollected + amount;
        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);
    }

    function getDonators(uint256 _id) public view returns (address[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    function withdrawFunds(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];

        require(msg.sender == campaign.owner, "Solo il creatore puo' prelevare");
        require(campaign.amountCollected >= campaign.target, "Target non raggiunto");
        require(campaign.amountCollected > 0, "Nessun fondo da prelevare");

        //Aggiorno stato prima di inviare soldi per evitare reentrancy attack
        uint256 amountToWithdraw = campaign.amountCollected;
        campaign.amountCollected = 0;

        (bool sent, ) = payable(campaign.owner).call{value: amountToWithdraw}("");
        require(sent, "Trasferimento fallito");
    }

    constructor() {
        // Inizializzazione
    }
}