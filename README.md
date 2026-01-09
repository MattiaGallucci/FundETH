# 🦄 FundETH - Decentralized Crowdfunding DApp

FundETH è una piattaforma di crowdfunding decentralizzata basata su Blockchain Ethereum. Permette agli utenti di creare campagne di raccolta fondi, effettuare donazioni in Ether e gestire il rilascio dei fondi in modo completamente trasparente e sicuro (trustless) tramite Smart Contract.

Il sistema garantisce che i fondi vengano rilasciati al creatore solo se l'obiettivo (Target) viene raggiunto; in caso contrario i donatori possono richiedere il rimborso automatico.

---

## 📑 Indice

- [Caratteristiche Principali](#-caratteristiche-principali)  
- [Architettura e Tecnologie](#-architettura-e-tecnologie)  
- [Prerequisiti](#-prerequisiti)  
- [Installazione e Configurazione](#-installazione-e-configurazione)  
  - [1. Clone e Setup](#1-clone-e-setup)  
  - [2. Configurazione Smart Contract](#2-configurazione-smart-contract)  
  - [3. Configurazione Frontend e IPFS](#3-configurazione-frontend-e-ipfs)  
- [Come Eseguire il Progetto](#-come-eseguire-il-progetto)  
- [Testing e Time Travel](#-testing-e-time-travel)  
- [Sicurezza e Design Pattern](#-sicurezza-e-design-pattern)  
- [Autore](#-autore)

---

## 🚀 Caratteristiche Principali

- Creazione Campagne: chiunque può lanciare una campagna impostando titolo, descrizione, target (ETH), scadenza e immagine di copertina.  
- Storage Decentralizzato: le immagini delle campagne sono salvate su IPFS (via Pinata) per ridurre i costi di gas.  
- Sistema di Escrow: i fondi donati restano bloccati nello Smart Contract fino alla conclusione della campagna.  
- Prelievo Condizionato: il creatore può prelevare i fondi solo se:
  - il target è stato raggiunto, e
  - il richiedente è il proprietario della campagna.  
- Rimborso Garantito: se la campagna scade senza raggiungere il target, i donatori possono richiedere indietro i propri ETH.  
- Interfaccia Web3: connessione tramite MetaMask, dashboard interattiva con barra di progresso e stato in tempo reale.

---

## 🛠 Architettura e Tecnologie

- Blockchain: Ethereum (uso di Hardhat per sviluppo e rete locale).  
- Smart Contract: Solidity (versione >= 0.8.x).  
- Frontend: React.js + Vite.  
- Web3 Integration: Ethers.js (v5).  
- File Storage: IPFS (Pinata consigliato).  
- Styling: CSS3 custom (design moderno e responsivo).  
- Tooling Smart Contract: Hardhat + @nomicfoundation/hardhat-toolbox.

Struttura generale del repo:

```
FundETH/
├── client/                 # Frontend React + Vite
│   ├── src/                # Codice sorgente (Componenti, Pagine, Logica)
│   ├── public/             # Assets statici
│   └── package.json
└── smart_contract/         # Ambiante Hardhat
    ├── contracts/          # Smart Contracts (CrowdFunding.sol)
    ├── scripts/            # Script di deploy e utilità (deploy.js, timeTravel.js, ...)
    ├── ignition/           # (opzionale) moduli ignition
    └── package.json
```

---

## 📋 Prerequisiti

Assicurati di avere installato:

- Node.js (v18 o superiore raccomandata) e npm.  
- Git.  
- MetaMask (estensione browser) configurata per la rete locale (Localhost 8545).  
- (Opzionale) Account Pinata per upload su IPFS (JWT API Key).

---

## ⚙️ Installazione e Configurazione

### 1. Clone e Setup

Clona il repository e accedi alla cartella:

```bash
git clone https://github.com/MattiaGallucci/FundETH.git
cd FundETH
```

### 2. Configurazione Smart Contract

Spostati nella cartella del backend (smart contract) e installa le dipendenze:

```bash
cd smart_contract
npm install
```

Avvia la blockchain locale di Hardhat:

```bash
npx hardhat node
```

Questo avvierà una rete locale (solitamente su `http://127.0.0.1:8545`) con account di test preregalati.

Effettua il deploy del contratto (esempio):

```bash
# dal folder smart_contract
npx hardhat run scripts/deploy.js --network localhost
```

⚠️ Dopo il deploy, il terminale mostrerà l'indirizzo del contratto (es. `0x5FbDB...`). Copialo.

Aggiorna il frontend con l'indirizzo e l'ABI:
- Apri `client/src/context/Web3Context.jsx` (o il file equivalente) e incolla l'indirizzo in `contractAddress`.
- Copia `artifacts/contracts/CrowdFunding.sol/CrowdFunding.json` in `client/src/context/CrowdFunding.json` (o sovrascrivi il file ABI presente) in modo che il frontend usi l'ABI corretta.

> Nota: Se il tuo progetto usa nomi o percorsi diversi per l'ABI/contesto, aggiorna quelli indicati di conseguenza.

### 3. Configurazione Frontend e IPFS (Pinata)

Spostati nella cartella del frontend e installa le dipendenze:

```bash
cd ../client
npm install
```

Configurazione Pinata (se usi IPFS per le immagini):
1. Crea un account su [Pinata](https://pinata.cloud/).
2. Genera una nuova API Key / JWT.
3. Crea un file `.env` nella cartella `client/` e aggiungi:

```env
VITE_PINATA_JWT=tuo_jwt_token_qui
```

Assicurati che il codice del frontend legga `VITE_PINATA_JWT` per caricare i file su Pinata/IPFS.

---

## ▶️ Come Eseguire il Progetto

1. Avvia il nodo Hardhat (se non è già attivo):

```bash
cd smart_contract
npx hardhat node
```

2. In un altro terminale, esegui il deploy (se non l'hai già fatto):

```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. Avvia il frontend:

```bash
cd ../client
npm run dev
```

4. Apri il browser su `http://localhost:5173` (o l'indirizzo mostrato da Vite).

MetaMask:
- Connetti MetaMask a `Localhost 8545`.
- Importa uno degli account privati forniti da Hardhat in MetaMask (trovi le chiavi private stampate nel terminale di `npx hardhat node`).
- Se incontri errori di nonce o transazioni pendenti, in MetaMask: Impostazioni → Avanzate → Cancella dati attività (o rescan degli account).

---

## ⏳ Testing e Time Travel

Per eseguire test unitari degli smart contract:

```bash
cd smart_contract
npx hardhat test
```

Per simulare il passare del tempo (utile per scadenze campagne) è disponibile uno script di time travel (se presente):

```bash
# esempio: avanzare di 30 giorni
npx hardhat run scripts/timeTravel.js --network localhost
```

Dopo l'esecuzione, ricarica l'interfaccia: le campagne potrebbero risultare scadute e abilitare funzioni come "Richiedi Rimborso" o "Preleva" in base allo stato.

---

## 🔒 Sicurezza e Design Pattern

Lo Smart Contract `CrowdFunding.sol` applica i seguenti pattern e buone pratiche:

- Checks-Effects-Interactions: lo stato viene aggiornato (es. azzeramento saldo) prima di effettuare transfer esterni per prevenire reentrancy.  
- Require Guards: validazioni con `require()` per input e stati (es. non donare a campagne scadute).  
- Pull over Push: rimborsi e prelievi sono "pull" (l'utente richiede i fondi) per evitare problemi DoS.  
- Limitazioni degli accessi: solo il proprietario della campagna può eseguire prelievi condizionati.  
- Uso di tipi e overflow-checks forniti da Solidity >=0.8.x.

Consigli aggiuntivi:
- Considera l'aggiunta di un mutex (o `ReentrancyGuard`) per ulteriori protezioni.  
- Usare test automatici approfonditi per casi limite e possibili attacchi (reentrancy, overflow/underflow, front-running).

---

## 👤 Autore

Progetto sviluppato per il corso di Sicurezza dei Dati

- Nome: Mattia Gallucci  
- Matricola: NF22500127
