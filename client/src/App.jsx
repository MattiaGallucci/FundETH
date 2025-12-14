import React, { useContext, useState } from 'react';
import { Web3Context } from './context/Web3Context';
import CreateCampaign from './CreateCampaign';
import FundModal from './FundModal';
import './App.css';

const App = () => {
  const { connectWallet, currentAccount, campaigns, isLoading, withdraw, refund, currentTimestamp } = useContext(Web3Context);
  
  // Stato per gestire il modale
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  return (
    <div className="container">
      
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">CryptoFund</div>
        {!currentAccount ? (
          <button onClick={connectWallet} className="btn btn-primary">Connetti Wallet</button>
        ) : (
          <div className="wallet-badge">
            Wallet: {currentAccount.slice(0,6)}...{currentAccount.slice(-4)}
          </div>
        )}
      </nav>

      {/* Sezione Creazione */}
      {currentAccount && <CreateCampaign />}

      {/* Griglia Campagne */}
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.8rem' }}>Campagne Attive ({campaigns.length})</h2>
      
      {isLoading && !selectedCampaign ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Blockchain data...</div>
      ) : (
        <div className="campaign-grid">
          {campaigns.length > 0 ? campaigns.map((camp) => {
            const isOwner = currentAccount && camp.owner === currentAccount.toLowerCase();
            const isExpired = currentTimestamp > camp.deadline;
            const targetReached = parseFloat(camp.amountCollected) >= parseFloat(camp.target);
            const hasDonated = currentAccount && camp.donators.includes(currentAccount.toLowerCase());
            const percent = Math.min((camp.amountCollected / camp.target) * 100, 100);

            return (
              <div key={camp.pId} className="card">
                <img src={camp.image} alt={camp.title} className="card-img" />
                
                <div className="card-content">
                  <h3 className="card-title">{camp.title}</h3>
                  <p className="card-desc">{camp.description}</p>
                  
                  <div className="progress-container">
                      <div className="progress-bar" style={{ width: `${percent}%` }}></div>
                  </div>

                  <div className="stats">
                    <span>💎 {camp.amountCollected} ETH</span>
                    <span>🎯 {camp.target} ETH</span>
                  </div>
                  
                  {/* Logica Bottoni */}
                  <div style={{ marginTop: 'auto' }}>
                    {isOwner && targetReached && parseFloat(camp.amountCollected) > 0 && (
                        <button onClick={() => withdraw(camp.pId)} className="btn btn-success" style={{width: '100%'}}>
                            Preleva Fondi
                        </button>
                    )}

                    {isExpired && !targetReached && hasDonated && parseFloat(camp.amountCollected) > 0 && (
                        <button onClick={() => refund(camp.pId)} className="btn btn-danger" style={{width: '100%'}}>
                            Richiedi Rimborso
                        </button>
                    )}

                    {isExpired && !targetReached && !hasDonated && (
                        <button disabled className="btn" style={{width: '100%', background: '#e5e7eb', color: '#9ca3af'}}>
                            Chiusa
                        </button>
                    )}

                    {!isExpired && (
                        <button onClick={() => setSelectedCampaign(camp)} className="btn btn-primary" style={{width: '100%'}}>
                            Dona Ora
                        </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : (
            <p>Nessuna campagna attiva al momento.</p>
          )}
        </div>
      )}

      {selectedCampaign && (
          <FundModal campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />
      )}
    </div>
  );
}

export default App;