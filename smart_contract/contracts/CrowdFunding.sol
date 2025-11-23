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

    // ID Campagna => (Indirizzo Donatore => Importo Donato)
    mapping(uint256 => mapping(address => uint256)) public campaignDonations;

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

        // GuardCheck
        require(block.timestamp < campaign.deadline, "La campagna e' scaduta");

        campaign.amountCollected = campaign.amountCollected + amount;
        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);

        campaignDonations[_id][msg.sender] += amount;
    }

    function getDonators(uint256 _id) public view returns (address[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    // Check-Effects-Interactions
    function withdrawFunds(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];

        require(msg.sender == campaign.owner, "Solo il creatore puo' prelevare");
        require(campaign.amountCollected >= campaign.target, "Target non raggiunto");
        require(campaign.amountCollected > 0, "Nessun fondo da prelevare");

        // Aggiorniamo stato prima di inviare soldi per evitare reentrancy attack
        uint256 amountToWithdraw = campaign.amountCollected;
        campaign.amountCollected = 0;
        (bool sent, ) = payable(campaign.owner).call{value: amountToWithdraw}("");
        require(sent, "Trasferimento fallito");
    }

    // Pull Over Push && Check-Effects-Interactions
    function refund(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];

        require(block.timestamp > campaign.deadline, "La campagna non e' ancora chiusa");
        require(campaign.amountCollected < campaign.target, "Il target e' stato raggiunto, niente rimborsi");

        uint256 donatedAmount = campaignDonations[_id][msg.sender];
        require(donatedAmount > 0, "Non hai donazioni da rimborsare");

        // Aggiorniamo stato prima di inviare soldi per evitare reentrancy attack
        campaignDonations[_id][msg.sender] = 0;
        (bool sent, ) = payable(msg.sender).call{value: donatedAmount}("");
        require(sent, "Rimborso fallito");
    }

    constructor() {
        
    }
}