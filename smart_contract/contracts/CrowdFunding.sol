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
        bool claimed;
    }

    mapping(uint256 => Campaign) public campaigns;

    // ID Campagna => (Indirizzo Donatore => Importo Donato)
    mapping(uint256 => mapping(address => uint256)) public campaignDonations;

    uint256 public numberOfCampaigns = 0;

    //Guard Check
    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        
        require(_deadline > block.timestamp, "La scadenza deve essere nel futuro");
        
        Campaign storage campaign = campaigns[numberOfCampaigns];

        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;
        campaign.claimed = false;

        numberOfCampaigns++;

        return numberOfCampaigns - 1;
    }

    //Guard Check
    function donateToCampaign(uint256 _id) public payable {
        uint256 amount = msg.value;
        Campaign storage campaign = campaigns[_id];

        require(block.timestamp < campaign.deadline, "La campagna e' scaduta");

        campaign.amountCollected = campaign.amountCollected + amount;
        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);

        campaignDonations[_id][msg.sender] += amount;
    }

    function getDonators(uint256 _id) public view returns (address[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    //Guard Check, Checks-Effects-Interactions
    function withdrawFunds(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];

        require(msg.sender == campaign.owner, "Solo il creatore puo prelevare");
        require(campaign.amountCollected >= campaign.target, "Target non raggiunto");
        require(!campaign.claimed, "Fondi gia' prelevati");

        campaign.claimed = true;

        // Inviamo tutto quello che è stato raccolto
        (bool sent, ) = payable(campaign.owner).call{value: campaign.amountCollected}("");
        require(sent, "Fallito l'invio di Ether");
}

    //Guard Check, Checks-Effects-Interactions, Pull over Push
    function refund(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];

        require(block.timestamp > campaign.deadline, "La campagna non e' ancora scaduta");
        require(campaign.amountCollected < campaign.target, "Il target e' stato raggiunto, impossibile rimborsare");

        uint256 donatedAmount = 0;

        // Cerchiamo quanto ha donato l'utente
        for(uint i = 0; i < campaign.donators.length; i++) {
            if(campaign.donators[i] == msg.sender) {
                donatedAmount = campaign.donations[i];
                
                campaign.donations[i] = 0; 
                
                break;
            }
        }

        require(donatedAmount > 0, "Nessuna donazione da rimborsare o gia' rimborsato");

        // Aggiorniamo il totale raccolto (opzionale ma consigliato per pulizia)
        campaign.amountCollected = campaign.amountCollected - donatedAmount;

        // Inviamo il rimborso
        (bool sent, ) = payable(msg.sender).call{value: donatedAmount}("");
        require(sent, "Fallito l'invio del rimborso");
    }

    constructor() {
        
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);

        for (uint256 i = 0; i < numberOfCampaigns; i++) {
            Campaign storage item = campaigns[i];
            allCampaigns[i] = item;
        }

        return allCampaigns;
    }
}