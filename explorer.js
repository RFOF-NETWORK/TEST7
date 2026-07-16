// Globales Kontroll-Objekt für den ausgelagerten Explorerconst GlobalExplorer = {
    
    // Diese Funktion wird aufgerufen, sobald ein Nutzer auf einen Hash im Log klickt
    inspect: function(hashValue, hashType, blockIndex) {
        // 1. Scroll-Vektor auslösen: Bewegt den Handy-Bildschirm flüssig nach ganz unten zum Explorer-Kasten
        const explorerContainer = document.getElementById('global-explorer');
        if (explorerContainer) {
            explorerContainer.scrollIntoView({ behavior: 'smooth' });
        }

        // 2. Das Textfeld im Explorer-Kasten ansteuern
        const detailsDisplay = document.getElementById('explorer-display-details');
        if (!detailsDisplay) return;

        // 3. Überprüfung der mathematischen Singularität: Ist das der allererste Block des ersten Nutzers?
        const isAbsoluteFirstUser = (blockIndex === 0 && hashValue !== "0000000000000000000000000000000000000000000000000000000000000000");

        // 4. Aufbau des Analyse-Zustands für das globale Sichtfeld
        let analysisText = `<strong>Geklickter Vektortyp:</strong> ${hashType}-Fraktal<br>`;
        analysisText += `<strong>Eingelesener String:</strong> <span style="color:#facc15; word-break:break-all;">${hashValue}</span><br><br>`;

        if (hashType === 'ID') {
            analysisText += `<strong>Hierarchischer Status:</strong> Übergeordnete ID-Kettenstruktur.<br>`;
            if (isAbsoluteFirstUser) {
                analysisText += `<strong>Befund:</strong> Du bist der <strong>allererste Urheber (Genesis-Singularität)</strong>. Vor diesem Interaktions-Hash existieren keine anderen globalen Ledger-Daten. Dein lokaler Start ist das Fundament des Netzwerks!`;
            } else {
                analysisText += `<strong>Befund:</strong> Dieser Vektor filtert die lückenlose, anonyme Lebenslinie dieser spezifischen Institution im globalen Register heraus.`;
            }
        } 
        else if (hashType === 'PREV') {
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
        } 
        else if (hashType === 'CURR') {
            analysisText += `<strong>Hierarchischer Status:</strong> Zustands-Versiegelung.<br>`;
            analysisText += `<strong>Befund:</strong> Finaler Block-Hash im globalen Gesamt-Kontext validiert. Jede Interaktion unter diesem Hash verändert den globalen Liquiditäts-Supply im Netzwerk.`;
        }

        // Schreiben der ermittelten Position in das Sichtfenster
        detailsDisplay.innerHTML = analysisText;
    },

    // Globale, mobile-kompatible Kopierfunktion für die Zwischenablage via echtem Unicode-Button
    copyText: function(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert("Hash erfolgreich in die Zwischenablage kopiert!");
        }).catch(err => {
            console.error("Fehler beim Kopieren: ", err);
        });
    },

    // REPARIERTE INTERZEPTIONS-MASCHINE: Teilt die Rohdaten anhand der Zeilenumbrüche (\n)
    interceptAndTransform: function() {
        const outputBox = document.getElementById('chain-output');
        if (!outputBox) return;

        const rawText = outputBox.innerText || outputBox.textContent;
        // Verhindert doppeltes Formatieren, wenn die Struktur bereits aufgebaut wurde
        if (!rawText || rawText.includes("System bereit") || rawText.includes("display: flex")) return;

        // Zerlegt den unformatierten Gesamttext sauber in Zeilen
        const lines = rawText.split('\n');
        let finalHTML = "";
        
        let currentBlockIndex = 0;
        let currentTime = "00:00:00";
        let currentType = "INTERAKTION";
        let currentDetails = "";
        let idHash = "";
        let prevHash = "";
        let currHash = "";

        // Wandelt die Rohdaten-Zeilen Schritt für Schritt im RAM in HTML-Vektoren um
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            if (trimmed.includes("Block #")) {
                // Falls ein neuer Block startet, verarbeite erst den vorherigen (falls vorhanden)
                if (idHash || prevHash || currHash) {
                    finalHTML += this.buildBlockHTML(currentBlockIndex, currentTime, currentType, currentDetails, idHash, prevHash, currHash);
                }
                
                // Extrahiert die Metadaten des neuen Blocks
                const timeMatch = trimmed.match(/^\[(.*?)\]/);
                currentTime = timeMatch ? timeMatch[1] : "00:00:00";
                
                const indexMatch = trimmed.match(/Block #(\d+)/);
                currentBlockIndex = indexMatch ? parseInt(indexMatch[1]) : 0;
                
                const typeMatch = trimmed.match(/\[([^\]]+)\]$/);
                currentType = typeMatch ? typeMatch[1] : "INTERAKTION";
                
                // Setze Hashes für den neuen Block zurück
                idHash = ""; prevHash = ""; currHash = ""; currentDetails = "";
            } 
            else if (trimmed.startsWith("• Details:")) {
                currentDetails = trimmed.replace("• Details:", "").trim();
            } 
            else if (trimmed.includes("ID-Hash:")) {
                idHash = trimmed.split("ID-Hash:")[1].trim();
            } 
            else if (trimmed.includes("Prev-Hash:")) {
                prevHash = trimmed.split("Prev-Hash:")[1].trim();
            } 
            else if (trimmed.includes("Curr-Hash:")) {
                currHash = trimmed.split("Curr-Hash:")[1].trim();
            }
        });

        // Schreibt den letzten verbleibenden Block in das HTML-Register
        if (idHash || prevHash || currHash) {
            finalHTML += this.buildBlockHTML(currentBlockIndex, currentTime, currentType, currentDetails, idHash, prevHash, currHash);
        }

        // Überschreibt den Kasten mit der neuen, sauberen Klick- und Kopierstruktur
        outputBox.innerHTML = finalHTML;
        outputBox.scrollTop = outputBox.scrollHeight;
    },

    // Baut die symmetrische HTML-Zeilenstruktur mit echten Kopier-Vierecken im RAM auf
    buildBlockHTML: function(index, time, type, details, id, prev, curr) {
        return `
            <div style="padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px dashed #334155; font-family: monospace;">
                <strong style="color: #10b981;">[${time}] ⛓️ Block #${index} [${type}]</strong><br>
                <span style="color: #f8fafc;">• Details: ${details}</span><br>
                
                <!-- ECHTE ID-HASH REIHE -->
                <div style="display: flex; justify-content: space-between; align-items: center; background: #090d16; padding: 6px 10px; border-radius: 4px; margin: 6px 0; gap: 10px; border: 1px solid #1e293b;">
                    <span style="color: #38bdf8; cursor: pointer; text-decoration: underline; flex: 1; word-break: break-all; font-size: 11px;" onclick="GlobalExplorer.inspect('${id}', 'ID', ${index})">ID-Hash: ${id}</span>
                    <button style="background: #334155; color: #f8fafc; border: 1px solid #475569; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; min-width: 38px;" onclick="GlobalExplorer.copyText('${id}')">📋</button>
                </div>
                
                <!-- ECHTE PREV-HASH REIHE -->
                <div style="display: flex; justify-content: space-between; align-items: center; background: #090d16; padding: 6px 10px; border-radius: 4px; margin: 6px 0; gap: 10px; border: 1px solid #1e293b;">
                    <span style="color: #38bdf8; cursor: pointer; text-decoration: underline; flex: 1; word-break: break-all; font-size: 11px;" onclick="GlobalExplorer.inspect('${prev}', 'PREV', ${index})">Prev-Hash: ${prev}</span>
                    <button style="background: #334155; color: #f8fafc; border: 1px solid #475569; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; min-width: 38px;" onclick="GlobalExplorer.copyText('${prev}')">📋</button>
                </div>
                
                <!-- ECHTE CURR-HASH REIHE -->
                <div style="display: flex; justify-content: space-between; align-items: center; background: #090d16; padding: 6px 10px; border-radius: 4px; margin: 6px 0; gap: 10px; border: 1px solid #1e293b;">
                    <span style="color: #38bdf8; cursor: pointer; text-decoration: underline; flex: 1; word-break: break-all; font-size: 11px;" onclick="GlobalExplorer.inspect('${curr}', 'CURR', ${index})">Curr-Hash: ${curr}</span>
                    <button style="background: #334155; color: #f8fafc; border: 1px solid #475569; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; min-width: 38px;" onclick="GlobalExplorer.copyText('${curr}')">📋</button>
                </div>
            </div>
        `;
    }
};


// Startet das automatische Überwachungs-Auge im Hintergrund
window.addEventListener('load', () => {
if (typeof system !== 'undefined') {
const targetNode = document.getElementById('chain-output');
if (targetNode) {
// Führe die Umwandlung sofort einmal aus, falls bereits Daten geladen wurden
GlobalExplorer.interceptAndTransform();
const observer = new MutationObserver(() => {
observer.disconnect();
GlobalExplorer.interceptAndTransform();
observer.observe(targetNode, { childList: true, subtree: true, characterData: true });
});
observer.observe(targetNode, { childList: true, subtree: true, characterData: true });
}
}
});
