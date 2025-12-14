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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 style={{marginTop: 0}}>Dona a {campaign.title}</h3>
        <p className="text-muted">Stai supportando un progetto decentralizzato.</p>
        
        <div className="input-group" style={{margin: '2rem 0'}}>
            <label>Quanto vuoi donare?</label>
            <input 
              className="form-input" 
              type="number" 
              step="0.01" 
              placeholder="0.1 ETH" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn" style={{background: '#f3f4f6'}}>Annulla</button>
          <button onClick={handleDonate} disabled={isLoading} className="btn btn-primary">
            {isLoading ? "In attesa..." : "Conferma Donazione"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FundModal;