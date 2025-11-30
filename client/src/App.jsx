import React, { useContext, useState } from 'react';
import { Web3Context } from './context/Web3Context';
import CreateCampaign from './CreateCampaign';
import FundModal from './FundModal';

const App = () => {
  const { connectWallet, currentAccount, campaigns, isLoading } = useContext(Web3Context);
  
  // Stato per gestire il modale
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '1200px', margin: '0 auto' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Crypto Crowdfunding</h1>
        {!currentAccount ? (
          <button onClick={connectWallet} style={btnStyle}>Connetti Wallet</button>
        ) : (
          <div style={{ background: '#e6fffa', padding: '8px 16px', borderRadius: '20px', border: '1px solid #38b2ac' }}>
            {currentAccount.slice(0,6)}...{currentAccount.slice(-4)}
          </div>
        )}
      </header>

      {currentAccount && (
        <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #eee', borderRadius: '10px' }}>
          <CreateCampaign />
        </div>
      )}

      <h2>Campagne Attive ({campaigns.length})</h2>
      
      {isLoading && !selectedCampaign ? ( // Mostra loading solo se non stiamo donando
        <p>Caricamento dalla Blockchain...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {campaigns.length > 0 ? campaigns.map((camp) => (
            <div key={camp.pId} style={cardStyle}>
              <img src={camp.image} alt={camp.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
              
              <div style={{ padding: '10px' }}>
                <h3>{camp.title}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>{camp.description}</p>
                
                <div style={{ margin: '10px 0', background: '#eee', borderRadius: '5px', height: '10px', overflow: 'hidden' }}>
                    <div style={{ 
                        width: `${Math.min((camp.amountCollected / camp.target) * 100, 100)}%`, 
                        background: '#007bff', height: '100%' 
                    }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '10px' }}>
                  <span>Raccolti: {camp.amountCollected} ETH</span>
                  <span>Target: {camp.target} ETH</span>
                </div>
                
                <button 
                    onClick={() => setSelectedCampaign(camp)}
                    style={{ ...btnStyle, width: '100%', marginTop: '10px', backgroundColor: '#6c5ce7' }}
                >
                   Dona Ora
                </button>
              </div>
            </div>
          )) : (
            <p>Nessuna campagna trovata.</p>
          )}
        </div>
      )}

      {selectedCampaign && (
          <FundModal 
            campaign={selectedCampaign} 
            onClose={() => setSelectedCampaign(null)} 
          />
      )}

    </div>
  );
}

const btnStyle = { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const cardStyle = { border: '1px solid #ddd', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', background: 'white' };

export default App;