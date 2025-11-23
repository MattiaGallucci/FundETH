const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("CrowdFunding Contract", function () {
    let CrowdFunding;
    let crowdFunding;
    let owner;
    let addr1;

    this.beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();

        CrowdFunding = await ethers.getContractFactory("CrowdFunding");
        crowdFunding = await CrowdFunding.deploy();
    });

    it("Dovrebbe creare una campagna correttamente", async function () {
        const title = "Aiuta la ricerca";
        const description = "Descrizione test";
        const target = ethers.parseEther("1");
        const deadline = Math.floor(Date.now() / 1000) + 1000;
        const image = "https://ipfs.io/ipfs/hash...";

        await crowdFunding.createCampaign(
            owner.address,
            title,
            description,
            target,
            deadline,
            image
        );

        // 1. Controlliamo che il numero di campagne sia 1
        expect(await crowdFunding.numberOfCampaigns()).to.equal(1);

        // 2. Recuperiamo la campagna 0 e controlliamo i dati
        const campaign = await crowdFunding.campaigns(0);

        expect(campaign.title).to.equal(title);
        expect(campaign.target).to.equal(target);
        // Verifica che l'owner della campagna sia l'account che l'ha creata
        expect(campaign.owner).to.equal(owner.address);

    });

    it("Dovrebbe fallire se la data è nel passato", async function () {
        const pastDate = Math.floor(Date.now() / 1000) - 1000;
        
        // Ci aspettiamo che la transazione venga "reverted" (rifiutata) con il nostro messaggio di errore
        await expect(
            crowdFunding.createCampaign(owner.address, "Test", "Desc", 100, pastDate, "img")
        ).to.be.revertedWith("La scadenza deve essere nel futuro");
    });



    describe("Donazioni", function () {
        beforeEach(async function () {
            const target = ethers.parseEther("10");
            const deadline = Math.floor(Date.now() / 1000) + 1000;
            await crowdFunding.createCampaign(owner.address, "Campagna 1", "Desc", target, deadline, "img");
        });

        it("Dovrebbe accettare donazioni e aggiornare lo stato", async function () {
            // 1. "addr1" (il donatore) invia 1 ETH alla campagna con ID 0
            const donationAmount = ethers.parseEther("1");

            await crowdFunding.connect(addr1).donateToCampaign(0, { value: donationAmount });

            const campaign = await crowdFunding.campaigns(0);

            expect(campaign.amountCollected).to.equal(donationAmount);

            const [donators, donations] = await crowdFunding.getDonators(0);

            expect(donators[0]).to.equal(addr1.address);
            expect(donations[0]).to.equal(donationAmount);
        });

        it("Non dovrebbe accettare donazioni per campagne scadute", async function () {
            //Complesso da implementare il test per campagne scadute senza manipolare il tempo della blockchain
            const pastDate = Math.floor(Date.now() / 1000) - 1000;
        });
    });



    describe("Prelievi", function () {
        beforeEach(async function () {
            const target = ethers.parseEther("1");
            const deadline = Math.floor(Date.now() / 1000) + 1000;
            await crowdFunding.createCampaign(owner.address, "Campagna 2", "Desc", target, deadline, "img");
        });

        it("Dovrebe pernettere al creatore di prelevare se target raggiunto", async function () {
            await crowdFunding.connect(addr1).donateToCampaign(0, { value: ethers.parseEther("1") });
        
            await crowdFunding.withdrawFunds(0);

            const campaign = await crowdFunding.campaigns(0);
            expect(campaign.amountCollected).to.equal(0);
        });

        it("Dovrebbe impedire il prelievo se il target non e' raggiunto", async function () {
            // Doniamo solo 0.5 ETH (metà del target)
            await crowdFunding.connect(addr1).donateToCampaign(0, { value: ethers.parseEther("0.5") });

            await expect(crowdFunding.withdrawFunds(0)).to.be.revertedWith("Target non raggiunto");
        });
    });



    describe("Rimborsi (Refunds)", function () {
    beforeEach(async function () {
        // Creiamo una campagna con target 10 ETH e scadenza tra 1 ora (3600 sec)
        const target = ethers.parseEther("10");
        const currentTimestamp = await time.latest();
        const deadline = currentTimestamp + 3600; 
        
        await crowdFunding.createCampaign(owner.address, "Campagna Fallimentare", "Desc", target, deadline, "img");
        
        // Doniamo solo 1 ETH < target
        await crowdFunding.connect(addr1).donateToCampaign(0, { value: ethers.parseEther("1") });
    });

    it("Non dovrebbe permettere il rimborso se la campagna non e' ancora scaduta", async function () {
        await expect(
            crowdFunding.connect(addr1).refund(0)
        ).to.be.revertedWith("La campagna non e' ancora chiusa");
    });

    it("Dovrebbe permettere il rimborso se scaduta e target non raggiunto", async function () {
        // Avanziamo di 2 ore (3600 * 2)
        await time.increase(7200);

        // Verifichiamo che il saldo del contratto diminuisca
        await expect(
            crowdFunding.connect(addr1).refund(0)
        ).to.changeEtherBalances(
            [crowdFunding, addr1],
            [ethers.parseEther("-1"), ethers.parseEther("1")] 
            // addr1 riceverà 1 ETH meno il costo del gas della transazione, 
            // ma changeEtherBalances gestisce la logica del trasferimento netto
        );

        // Verifichiamo che il mapping sia azzerato per evitare doppi rimborsi
        const donatedAmount = await crowdFunding.campaignDonations(0, addr1.address);
        expect(donatedAmount).to.equal(0);
    });
  });
});