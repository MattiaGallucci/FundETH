import React, { useContext, useState } from 'react';
import { Web3Context } from './context/Web3Context';
import CreateCampaign from './CreateCampaign';
import FundModal from './FundModal';
import './App.css';

const App = () => {
  const { connectWallet, currentAccount, campaigns, isLoading, withdraw, refund, currentTimestamp, disconnectWallet } = useContext(Web3Context);

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
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="wallet-badge">
              {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
            </div>
            <button onClick={disconnectWallet} className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>
              Esci
            </button>
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
            const isFinished = camp.claimed;
            const userIndex = currentAccount ? camp.donators.indexOf(currentAccount.toLowerCase()) : -1;
            const userDonation = userIndex > -1 ? parseFloat(camp.donations[userIndex]) : 0;
            const hasActiveDonation = userDonation > 0; // Ha soldi dentro
            const wasRefunded = userIndex > -1 && userDonation === 0; // Era donatore, ora ha 0 (Rimborsato)


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

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', fontSize: '0.9rem', color: '#6b7280' }}>

                    {/* Mostriamo la data formattata (es. 25/12/2024) */}
                    <span>
                      📅 Scade il: <strong>{new Date(camp.deadline * 1000).toLocaleDateString()}</strong>
                    </span>

                    {/* Bonus: Calcoliamo i giorni rimasti se la campagna è attiva */}
                    {!isExpired && !isFinished && (
                      <span style={{ color: '#6366f1', fontWeight: 'bold', background: '#e0e7ff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem' }}>
                        {Math.ceil((camp.deadline - currentTimestamp) / (60 * 60 * 24))} giorni rimasti
                      </span>
                    )}

                    {isExpired && <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Scaduta</span>}
                  </div>

                  {/* Logica Bottoni */}
                  <div style={{ marginTop: 'auto' }}>

                    {/* 1. Prelievo Effettuato (Owner ha incassato) */}
                    {isFinished ? (
                      <button disabled className="btn" style={{ width: '100%', background: '#10b981', color: 'white', opacity: 1, cursor: 'default', border: 'none' }}>
                        ✅ Prelievo Effettuato
                      </button>
                    ) : (
                      <>
                        {/* 2. Owner: Preleva */}
                        {isOwner && targetReached && parseFloat(camp.amountCollected) > 0 && (
                          <button onClick={() => withdraw(camp.pId)} className="btn btn-success" style={{ width: '100%' }}>
                            💰 Preleva {camp.amountCollected} ETH
                          </button>
                        )}

                        {/* CASO RIMBORSO (Mostra SOLO se hasActiveDonation è vero) */}
                        {isExpired && !targetReached && hasActiveDonation && (
                          <button onClick={() => refund(camp.pId)} className="btn btn-danger" style={{ width: '100%' }}>
                            💸 Richiedi Rimborso
                          </button>
                        )}

                        {/* CASO RIMBORSATO (Mostra se wasRefunded è vero) */}
                        {isExpired && !targetReached && wasRefunded && (
                          <button disabled className="btn" style={{ width: '100%', background: '#fcd34d', color: '#78350f', opacity: 1, cursor: 'default', border: 'none' }}>
                            ↩️ Rimborso Effettuato
                          </button>
                        )}

                        {/* 5. Chiusa (Utente esterno o non donatore) */}
                        {isExpired && !targetReached && !hasActiveDonation && !wasRefunded && (
                          <button disabled className="btn" style={{ width: '100%', background: '#e5e7eb', color: '#9ca3af' }}>
                            ❌ Chiusa
                          </button>
                        )}

                        {/* 6. Dona Ora */}
                        {!isExpired && !targetReached && (
                          <button onClick={() => setSelectedCampaign(camp)} className="btn btn-primary" style={{ width: '100%' }}>
                            Dona Ora
                          </button>
                        )}

                        {/* 7. Target Raggiunto (Attesa) */}
                        {!isExpired && targetReached && !isOwner && (
                          <button disabled className="btn" style={{ width: '100%', background: '#d1fae5', color: '#065f46', cursor: 'default' }}>
                            🎉 Obiettivo Raggiunto!
                          </button>
                        )}
                      </>
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