import React, { useEffect, useState, createContext } from 'react';
import { ethers } from 'ethers';

import CrowdFundingABI from './CrowdFunding.json';

const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; //Cambia ad ogni delpoy.

export const Web3Context = createContext();
 
const { ethereum } = window;

export const Web3Provider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState("");

    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [currentTimestamp, setCurrentTimestamp] = useState(0);

    // Funzione per ottenere l'istanza del contratto
    const getEthereumContract = () => {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const transactionContract = new ethers.Contract(contractAddress, CrowdFundingABI.abi, signer);

        return transactionContract;
    }

    // Funzione per connettere il wallet
    const connectWallet = async () => {
        try {
            if (!ethereum) return alert("Per favore installa MetaMask.");

            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);
            throw new Error("Nessun oggetto ethereum trovato");
        }
    }

    // Funzione per controllare se il wallet è già connesso al caricamento della pagina
    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) return alert("Per favore installa MetaMask.");

            const accounts = await ethereum.request({ method: "eth_accounts" });

            if (accounts.length) {
                setCurrentAccount(accounts[0]);
            } else {
                console.log("Nessun account trovato");
            }
        } catch (error) {
            console.log(error);
            throw new Error("Nessun oggetto ethereum trovato");
        }
    }

    const fetchCampaigns = async () => {
        setIsLoading(true);
        try {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const contract = getEthereumContract();

            const data = await contract.getCampaigns();

            const block = await provider.getBlock('latest');
            setCurrentTimestamp(block.timestamp);

            const parsedCampaigns = data.map((campaign, i) => ({
                owner: campaign.owner.toLowerCase(),
                title: campaign.title,
                description: campaign.description,
                target: ethers.utils.formatEther(campaign.target.toString()),
                deadline: campaign.deadline.toNumber(),
                amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
                image: campaign.image,
                donators: campaign.donators.map(d => d.toLowerCase()),
                pId: i
            }));

            console.log("Campagne caricate:", parsedCampaigns);
            setCampaigns(parsedCampaigns);
        } catch (error) {
            console.log("Errore nel caricamento delle campagne:", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if(contractAddress) fetchCampaigns();
    }, [currentAccount]);

    const donate = async (pId, amount) => {
        setIsLoading(true);
        try {
            const contract = getEthereumContract();

            const amountInWei = ethers.utils.parseEther(amount);

            const transaction = await contract.donateToCampaign(pId, { value: amountInWei });

            await transaction.wait();
            console.log("Donazione effettuata con successo", transaction);

            fetchCampaigns();
        } catch (error) {
            console.log("Errore durante la donazione:", error);
            alert("Errore durante la donazione. Vedi console per dettagli.");
        }
        setIsLoading(false);
    }

    // Funzione per il Creatore: Preleva i fondi
    const withdraw = async (pId) => {
        setIsLoading(true);
        try {
            const contract = getEthereumContract();
            const transaction = await contract.withdrawFunds(pId);
            await transaction.wait();
            console.log("Prelievo effettuato con successo", transaction);

            fetchCampaigns();
        } catch (error) {
            console.log("Errore durante il prelievo:", error);
            alert("Errore durante il prelievo. Vedi console per dettagli.");
        }
        setIsLoading(false);
    }

    const refund = async (pId) => {
        setIsLoading(true);
        try {
            const contract = getEthereumContract();
            const transaction = await contract.refund(pId);
            await transaction.wait();
            console.log("Rimborso effettuato con successo", transaction);
            fetchCampaigns();
        } catch (error) {
            console.log("Errore durante il rimborso:", error);
            alert("Errore durante il rimborso. Vedi console per dettagli.");
        }
        setIsLoading(false);
    }

    return (
        <Web3Context.Provider value={{ 
            connectWallet, 
            currentAccount, 
            campaigns, 
            fetchCampaigns, 
            isLoading,
            donate,
            withdraw,
            refund,
            getEthereumContract,
            currentTimestamp
        }}>
            {children}
        </Web3Context.Provider>
    );
}