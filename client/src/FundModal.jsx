import React, { useState, useContext } from 'react';
import { Web3Context } from './context/Web3Context';

const FundModal = ({ campaign, onClose }) => {
  const { donate, isLoading } = useContext(Web3Context);
  const [amount, setAmount] = useState("");

  const handleDonate = async () => {
    if (!amount || amount <= 0) return alert("Inserisci un importo valido");
    // campaign.pId è l'ID della campagna sulla blockchain
    await donate(campaign.pId, amount);
    onClose();
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>Dona a: {campaign.title}</h3>
        <p>Target: {campaign.target} ETH - Raccolti: {campaign.amountCollected} ETH</p>
        
        <input 
          type="number" 
          step="0.01" 
          placeholder="Importo in ETH (es. 0.1)" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '10px 0' }}
        />

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{...btnStyle, backgroundColor: '#ccc', color: 'black'}}>Annulla</button>
          <button onClick={handleDonate} disabled={isLoading} style={btnStyle}>
            {isLoading ? "In corso..." : "Conferma Donazione"}
          </button>
        </div>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.7)',
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 1000
};

const modalStyle = {
  backgroundColor: 'white', padding: '20px', borderRadius: '10px',
  width: '400px', maxWidth: '90%'
};

const btnStyle = {
  padding: '10px 20px', backgroundColor: '#007bff', color: 'white', 
  border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
};

export default FundModal;