import React, { useState, useContext } from 'react';
import { Web3Context } from './context/Web3Context';
import axios from 'axios';
import { ethers } from 'ethers';

const CreateCampaign = () => {
    const { getEthereumContract, currentAccount } = useContext(Web3Context);

    const [form, setForm] = useState({
        title: '',
        description: '',
        target: '',
        deadline: '',
        image: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const uploadToPinata = async (file) => {
        const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

        let data = new FormData();
        data.append('file', file);

        /*const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY;
        const pinataSecretApiKey = import.meta.env.VITE_PINATA_SECRET_API_KEY;

        if (!pinataApiKey || !pinataSecretApiKey) {
            alert("Errore: Chiavi Pinata non trovate nel file .env");
            return null;
        }*/
        
        const pinataJWT = import.meta.env.VITE_PINATA_JWT;

        if (!pinataJWT) {
            alert("Errore: JWT Pinata non trovato nel file .env");
            return null;
        }

        try {
            const res = await axios.post(url, data, {
                headers: {
                    // Axios imposta automaticamente il boundary per FormData, 
                    // noi dobbiamo solo aggiungere l'Authorization
                    'Authorization': `Bearer ${pinataJWT}`
                }
            });
            console.log("Upload riuscito:", res.data);
            return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
        } catch (error) {
            console.error('Errore uploading IPFS:', error);
            return null;
        }
    };

    const handleFormFieldChange = (fieldName, e) => {
        setForm({ ...form, [fieldName]: e.target.value });
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        let imageUrl = '';
        if (imageFile) {
            imageUrl = await uploadToPinata(imageFile);
            if(!imageUrl) return alert ("Errore caricamento immagine");
        }

        const { title, description, target, deadline } = form;

        const targetInWei = ethers.utils.parseUnits(target, 18);
        const deadlineTimestamp = new Date(deadline).getTime() / 1000;

        try {
            const contract = getEthereumContract();

            const transactin = await contract.createCampaign(
                currentAccount,
                title,
                description,
                targetInWei,
                deadlineTimestamp,
                imageUrl
            );

            await transactin.wait();
            alert("Campagna creata con successo!");
            setIsLoading(false);
        } catch (error) {
            console.error("Errore creazione campagna:", error);
            setIsLoading(false);
        }
    };

    return (
    <div className="form-card">
      <h2 style={{marginTop: 0}}>🚀 Lancia una nuova campagna</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="input-group">
                <label className="text-muted">Titolo</label>
                <input className="form-input" placeholder="Titolo progetto" onChange={(e) => handleFormFieldChange('title', e)} required />
            </div>
            <div className="input-group">
                <label>Target (ETH)</label>
                <input className="form-input" type="number" step="0.01" placeholder="Es. 1.5" onChange={(e) => handleFormFieldChange('target', e)} required />
            </div>
        </div>
        
        <div className="input-group">
            <label>Descrizione</label>
            <textarea className="form-textarea" rows="3" placeholder="Racconta la tua storia..." onChange={(e) => handleFormFieldChange('description', e)} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="input-group">
                <label>Scadenza</label>
                <input className="form-input" type="date" onChange={(e) => handleFormFieldChange('deadline', e)} required />
            </div>
            <div className="input-group">
                <label>Copertina</label>
                <input className="form-input" type="file" accept="image/*" onChange={handleImageChange} required />
            </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{marginTop: '1rem'}} disabled={isLoading}>
            {isLoading ? "Creazione in corso..." : "Pubblica Campagna"}
        </button>
      </form>
    </div>
  );
}

export default CreateCampaign;