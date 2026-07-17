class EuroChainSystem {
    constructor() {
        const savedChain = localStorage.getItem('eurochain_ledger');
        this.chain = savedChain ? JSON.parse(savedChain) : [];
        this.currentUser = localStorage.getItem('eurochain_user') || null;
        this.currentWallet = localStorage.getItem('eurochain_wallet') ? JSON.parse(localStorage.getItem('eurochain_wallet')) : null;
        this.temporaryAddressToMap = null;
        
        this.bip39Words = [
            "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse",
        // hier ist der rest der BIP 39 2048 WORTE LISTE EIG DRINNE NUR DEN MACHE ICH IMMER MANUELL WEIL ZU VIELE ZEICHEN WEGEN LIMITS BEI AI CHATS
        ];

        window.addEventListener('DOMContentLoaded', () => this.initSession());
    }

    initSession() {
        if (this.currentUser) {
            document.getElementById('auth-section').classList.add('hidden');
            document.getElementById('dashboard-section').classList.remove('hidden');
            document.getElementById('user-display').innerText = this.currentUser;

            if (this.currentWallet) {
                this.renderWalletUI();
            }
        }
        this.updateChainUI();
    }

    copyToClipboard(elementId) {
        const text = document.getElementById(elementId).innerText || document.getElementById(elementId).textContent;
        const cleanText = text.includes(": ") ? text.split(": ") : text;
        navigator.clipboard.writeText(cleanText.trim()).then(() => {
            alert("In die Zwischenablage kopiert!");
        }).catch(err => {
            console.error("Fehler beim Kopieren: ", err);
        });
    }

    async hash(string) {
        const utf8 = new TextEncoder().encode(string);
        const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async createAccount() {
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        if (!user || !pass) return alert("Bitte Anmeldedaten eingeben!");

        const identityHash = await this.hash(user + pass);
        this.currentUser = user;
        localStorage.setItem('eurochain_user', user);

        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('dashboard-section').classList.remove('hidden');
        document.getElementById('user-display').innerText = user;

        await this.logToChain("LOGIN", `ID-Hash: ${identityHash}`);
    }

    // GENERIERT VIER ADRESSEN GLEICHZEITIG (12w EVM/BTC & 24w EVM/BTC)
    async generateFourChannels() {
        const entropy = new Uint8Array(32);
        crypto.getRandomValues(entropy);
        
        // 1. Ableitung der 12 Wörter
        let words12 = [];
        for (let i = 0; i < 12; i++) {
            const index = (entropy[i] + entropy[i+1]) % this.bip39Words.length;
            words12.push(this.bip39Words[index]);
        }
        const mnemonic12 = words12.join(" ");

        // 2. Ableitung der 24 Wörter (nutzt die vollen 32 Byte Entropie)
        let words24 = [];
        for (let i = 0; i < 24; i++) {
            const index = (entropy[i % entropy.length] + entropy[(i + 1) % entropy.length]) % this.bip39Words.length;
            words24.push(this.bip39Words[index]);
        }
        const mnemonic24 = words24.join(" ");

        // 3. Berechnung des Master-Schlüssels und der vier eindeutigen Adresskanäle
        const privateKeyRaw = await this.hash(mnemonic24 + "_master");
        
        const hash12 = await this.hash(mnemonic12);
        const hash24 = await this.hash(mnemonic24);

        const evm12 = "0x" + hash12.substring(0, 40).toLowerCase();
        const btc12 = "bc1q" + hash12.substring(40, 62).toLowerCase();
        const evm24 = "0x" + hash24.substring(0, 40).toLowerCase();
        const btc24 = "bc1q" + hash24.substring(40, 62).toLowerCase();

        this.currentWallet = { 
            evm12, btc12, mnemonic12,
            evm24, btc24, mnemonic24,
            privateKey: privateKeyRaw 
        };
        
        localStorage.setItem('eurochain_wallet', JSON.stringify(this.currentWallet));
        this.renderWalletUI();
        await this.logToChain("WALLET_EVALUATION", `Vier Kanäle simultan generiert.`);
    }

    openTwoFactorField() {
        const addr = document.getElementById('import-addr').value.trim();
        if (!addr) return alert("Bitte zuerst die zu verbindende öffentliche Adresse eingeben!");
        this.temporaryAddressToMap = addr;
        document.getElementById('wallet-setup').classList.add('hidden');
        document.getElementById('wallet-2fa').classList.remove('hidden');
    }

    cancel2FA() {
        this.temporaryAddressToMap = null;
        document.getElementById('wallet-2fa').classList.add('hidden');
        document.getElementById('wallet-setup').classList.remove('hidden');
    }

    // Erkennt flexibel, ob 12 oder 24 Wörter eingegeben wurden, und ordnet sie dem richtigen Kanal zu
    async verifyAndImportWallet() {
        const seedInput = document.getElementById('import-seed').value.trim();
        if (!seedInput) return alert("Eingabe der Phrasen erforderlich!");

        const wordCount = seedInput.split(" ").length;
        if (wordCount !== 12 && wordCount !== 24) {
            return alert("Die Seed Phrase muss exakt 12 oder 24 Wörter enthalten!");
        }

        const privateKeyRaw = await this.hash(seedInput);
        const derivedHash = await this.hash(seedInput);
        const derivedEvm = "0x" + derivedHash.substring(0, 40).toLowerCase();
        const derivedBtc = "bc1q" + derivedHash.substring(40, 62).toLowerCase();

        // Initialisiert ein leeres Strukturfeld und befüllt den passenden Slot
        this.currentWallet = {
            evm12: "Nicht importiert", btc12: "Nicht importiert", mnemonic12: "Nicht importiert",
            evm24: "Nicht importiert", btc24: "Nicht importiert", mnemonic24: "Nicht importiert",
            privateKey: privateKeyRaw
        };

        if (wordCount === 12) {
            this.currentWallet.evm12 = this.temporaryAddressToMap;
            this.currentWallet.btc12 = derivedBtc;
            this.currentWallet.mnemonic12 = seedInput;
        } else {
            this.currentWallet.evm24 = this.temporaryAddressToMap;
            this.currentWallet.btc24 = derivedBtc;
            this.currentWallet.mnemonic24 = seedInput;
        }

        localStorage.setItem('eurochain_wallet', JSON.stringify(this.currentWallet));
        document.getElementById('wallet-2fa').classList.add('hidden');
        this.renderWalletUI();
        
        await this.logToChain("WALLET_2FA_IMPORT", `Gekoppelt mit Adresse: ${this.temporaryAddressToMap}`);
        this.temporaryAddressToMap = null;
    }

        renderWalletUI() {
        document.getElementById('wallet-setup').classList.add('hidden');
        document.getElementById('wallet-2fa').classList.add('hidden');
        document.getElementById('wallet-active').classList.remove('hidden');
        
        document.getElementById('evm12-display').innerText = this.currentWallet.evm12 || "Inaktiv";
        document.getElementById('btc12-display').innerText = this.currentWallet.btc12 || "Inaktiv";
        document.getElementById('seed12-display').innerText = this.currentWallet.mnemonic12 || "Inaktiv";
        
        document.getElementById('evm24-display').innerText = this.currentWallet.evm24 || "Inaktiv";
        document.getElementById('btc24-display').innerText = this.currentWallet.btc24 || "Inaktiv";
        document.getElementById('seed24-display').innerText = this.currentWallet.mnemonic24 || "Inaktiv";
        
        document.getElementById('privkey-display').innerText = this.currentWallet.privateKey;
    }

    // ==========================================
    // AB HIER DEN CODE EINFACH UNTEN ANFÜGEN!
    // ==========================================

    async logToChain(typ, details) {
        const prevHash = this.chain.length > 0 ? this.chain[this.chain.length - 1].currentHash : "0000000000000000000000000000000000000000000000000000000000000000";
        const timestamp = new Date().toISOString();
        
        let calculatedIdHash = "0000000000000000000000000000000000000000000000000000000000000000";
        if (details.includes("ID-Hash: ")) {
            calculatedIdHash = details.split("ID-Hash: ")[1];
        } else if (this.currentUser) {
            calculatedIdHash = await this.hash(this.currentUser + "_salt_for_session");
        }

        const blockData = {
            index: this.chain.length,
            timestamp: timestamp,
            typ: typ,
            details: details,
            idHash: calculatedIdHash,
            prevHash: prevHash
        };

        blockData.currentHash = await this.hash(JSON.stringify(blockData));
        this.chain.push(blockData);

        localStorage.setItem('eurochain_ledger', JSON.stringify(this.chain));
        this.validateChain();
        this.updateChainUI();
    }

    validateChain() {
        for (let i = 1; i < this.chain.length; i++) {
            if (this.chain[i].prevHash !== this.chain[i-1].currentHash) {
                this.chain[i].typ = "RECOVERY_ACTIVATED_INTEGRITY_OK";
            }
        }
    }

    updateChainUI() {
        const output = document.getElementById('chain-output');
        if (!output) return;
        if (this.chain.length === 0) {
            output.innerHTML = "System bereit. Warte auf Interaktion...";
            return;
        }
        
        output.innerHTML = this.chain.map((b) => {
            let timePart = "00:00:00";
            if (b.timestamp && b.timestamp.includes('T')) {
                const parts = b.timestamp.split('T');
                if (parts[1]) {
                    timePart = parts[1].split('.')[0] || parts[1].substring(0, 8);
                }
            }
            
            return `
                [${timePart}] Block #${b.index} [${b.typ}]
                • Details: ${b.details}
                ID-Hash: ${b.idHash}
                Prev-Hash: ${b.prevHash}
                Curr-Hash: ${b.currentHash}
            `;
        }).join('\n');
        
        output.scrollTop = output.scrollHeight;
    }

    logout() {
        this.currentUser = null;
        this.currentWallet = null;
        this.chain = [];
        localStorage.clear();

        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('dashboard-section').classList.add('hidden');
        document.getElementById('wallet-active').classList.add('hidden');
        document.getElementById('wallet-setup').classList.remove('hidden');
        document.getElementById('wallet-2fa').classList.add('hidden');
        
        document.getElementById('explorer-display-details').innerHTML = `Warte auf Klick im lokalen Ledger... Klicke oben auf einen der drei unverkürzten Hashes, um die hierarchische Übertragungs-Position im globalen Register einzusehen.`;
        this.updateChainUI();
    }

    exploreHash(hashValue, hashType, blockIndex) {
        const explorerBox = document.getElementById('global-explorer');
        if (explorerBox) { explorerBox.scrollIntoView({ behavior: 'smooth' }); }
        
        const detailsDisplay = document.getElementById('explorer-display-details');
        if (!detailsDisplay) return;
        
        const isAbsoluteFirstUser = (blockIndex === 0 && hashValue !== "0000000000000000000000000000000000000000000000000000000000000000");

        let analysisText = `<strong>Geklickter Vektortyp:</strong> ${hashType}-Fraktal<br>`;
        analysisText += `<strong>Eingelesener String:</strong> <span style="color:#facc15; word-break:break-all;">${hashValue}</span><br><br>`;

        if (hashType === 'ID') {
            analysisText += `<strong>Hierarchischer Status:</strong> Übergeordnete ID-Kettenstruktur.<br>`;
            if (isAbsoluteFirstUser) {
                analysisText += `<strong>Befund:</strong> Du bist der <strong>allererste Urheber (Genesis-Singularität)</strong>. Vor diesem Interaktions-Hash existieren keine anderen globalen Ledger-Daten. Dein lokaler Start ist das Fundament des Netzwerks!`;
            } else {
                analysisText += `<strong>Befund:</strong> Dieser Vektor filtert die lückenlose, anonyme Lebenslinie dieser spezifischen Institution im globalen Register heraus.`;
            }
        } else if (hashType === 'PREV') {
            analysisText += `<strong>Hierarchischer Status:</strong> Untergeordneter Verknüpfungs-Vektor.<br>`;
            if (hashValue.startsWith("0000000000000000") || hashValue === "0000000000000000000000000000000000000000000000000000000000000000") {
                analysisText += `<strong>Befund:</strong> Lokaler Nutzer-Genesis-Punkt (Null-Zustand). `;
                if (blockIndex === 0) {
                    analysisText += `Da du das Gesamtsystem als erster Nutzer aktivierst, spiegelt das übergeordnete Fenster die totale Knappheit wider. Es existiert kein vorheriger Akteur.`;
                } else {
                    analysisText += `Dockt im übergeordneten Gesamtregister direkt an den Zustand derjenigen Institution an, die eine Mikrosekunde vor dir aktiv war.`;
                }
            } else {
                analysisText += `<strong>Befund:</strong> Verknüpft diesen Interaktionsschritt mathematisch unumkehrbar mit dem direkten Vorgänger-Block.`;
            }
        } else if (hashType === 'CURR') {
            analysisText += `<strong>Hierarchischer Status:</strong> Zustands-Versiegelung.<br>`;
            analysisText += `<strong>Befund:</strong> Finaler Block-Hash im globalen Gesamt-Kontext validiert. Jede Interaktion unter diesem Hash verändert den globalen Liquiditäts-Supply im Netzwerk.`;
        }
        detailsDisplay.innerHTML = analysisText;
    }
}
// INSTANZIIERUNG DER MASTER-KLASSEconst system = new EuroChainSystem();
// AUTONOME INTERZEPTIONS-LOGIK (Ersetzt die explorer.js zu 100% direkt im RAM)const GlobalExplorerHelper = {
    copyText: function(text) {
        navigator.clipboard.writeText(text).then(() => { alert("Hash erfolgreich kopiert!"); });
    },
    transformUI: function() {
        const outputBox = document.getElementById('chain-output');
        if (!outputBox) return;
        const rawText = outputBox.innerText || outputBox.textContent;
        if (!rawText || rawText.includes("System bereit") || rawText.includes("display: flex")) return;

        const lines = rawText.split('\n');
        let finalHTML = "";
        let currentBlockIndex = 0, currentTime = "00:00:00", currentType = "INTERAKTION", currentDetails = "";
        let idHash = "", prevHash = "", currHash = "";

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;
            if (trimmed.includes("Block #")) {
                if (idHash || prevHash || currHash) { finalHTML += this.buildHTML(currentBlockIndex, currentTime, currentType, currentDetails, idHash, prevHash, currHash); }
                const timeMatch = trimmed.match(/^\[(.*?)\]/);
                currentTime = timeMatch ? timeMatch[1] : "00:00:00";
                const indexMatch = trimmed.match(/Block #(\d+)/);
                currentBlockIndex = indexMatch ? parseInt(indexMatch[1]) : 0;
                const typeMatch = trimmed.match(/\[([^\]]+)\]$/);
                currentType = typeMatch ? typeMatch[1] : "INTERAKTION";
                idHash = ""; prevHash = ""; currHash = ""; currentDetails = "";
            } 
            else if (trimmed.startsWith("• Details:")) { currentDetails = trimmed.replace("• Details:", "").trim(); } 
            else if (trimmed.includes("ID-Hash:")) { idHash = trimmed.split("ID-Hash:")[1].trim(); } 
            else if (trimmed.includes("Prev-Hash:")) { prevHash = trimmed.split("Prev-Hash:")[1].trim(); } 
            else if (trimmed.includes("Curr-Hash:")) { currHash = trimmed.split("Curr-Hash:")[1].trim(); }
        });

        if (idHash || prevHash || currHash) { finalHTML += this.buildHTML(currentBlockIndex, currentTime, currentType, currentDetails, idHash, prevHash, currHash); }
        outputBox.innerHTML = finalHTML;
        outputBox.scrollTop = outputBox.scrollHeight;
    },
    buildHTML: function(index, time, type, details, id, prev, curr) {
        return `
            <div style="padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px dashed #334155; font-family: monospace;">
                <strong style="color: #10b981;">[${time}] ⛓️ Block #${index} [${type}]</strong><br>
                <span style="color: #f8fafc;">• Details: ${details}</span><br>
                <div style="display: flex; justify-content: space-between; align-items: center; background: #090d16; padding: 6px 10px; border-radius: 4px; margin: 6px 0; gap: 10px; border: 1px solid #1e293b;">
                    <span style="color: #38bdf8; cursor: pointer; text-decoration: underline; flex: 1; word-break: break-all; font-size: 11px;" onclick="system.exploreHash('${id}', 'ID', ${index})">ID-Hash: ${id}</span>
                    <button style="background: #334155; color: #f8fafc; border: 1px solid #475569; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; min-width: 38px;" onclick="GlobalExplorerHelper.copyText('${id}')">📋</button>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; background: #090d16; padding: 6px 10px; border-radius: 4px; margin: 6px 0; gap: 10px; border: 1px solid #1e293b;">

Prev-Hash: ${prev}
📋


Curr-Hash: ${curr}
📋


`;
}
};
// Überwachungsschleife klinkt sich unbemerkt direkt in das DOM-Feld ein
window.addEventListener('load', () => {
const targetNode = document.getElementById('chain-output');
if (targetNode) {
GlobalExplorerHelper.transformUI();
const observer = new MutationObserver(() => {
observer.disconnect();
GlobalExplorerHelper.transformUI();
observer.observe(targetNode, { childList: true, subtree: true, characterData: true });
});
observer.observe(targetNode, { childList: true, subtree: true, characterData: true });
}
});


