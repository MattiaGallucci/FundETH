const { expect } = require("chai");
const { ethers } = require("hardhat");

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
});