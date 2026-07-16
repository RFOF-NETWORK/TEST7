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

    // Globale, mobile-kompatible Kopierfunktion für die Zwischenablage
    copyText: function(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert("Hash erfolgreich in die Zwischenablage kopiert!");
        }).catch(err => {
            console.error("Fehler beim Kopieren: ", err);
        });
    },

    // AUTOMATISCHE INTERZEPTIONS-MASCHINE: Formatiert die Rohdaten der app.js im RAM um
    interceptAndTransform: function() {
        const outputBox = document.getElementById('chain-output');
        if (!outputBox) return;

        // Extrahiert den rohen Textinhalt, den Ihre app.js hineingeschrieben hat
        const rawText = outputBox.innerText || outputBox.textContent;
        if (!rawText || rawText.includes("System bereit") || rawText.includes("explorer-row")) return;

        // Zerlegt den Text in einzelne Blöcke, falls mehrere vorhanden sind
        const blocks = rawText.split(/Block #/g);
        let finalHTML = "";

        blocks.forEach(blockStr => {
            if (!blockStr.trim()) return;

            // Extrahiert den Index des Blocks
            const indexMatch = blockStr.match(/^(\document|\d+)/);
            const blockIndex = indexMatch ? parseInt(indexMatch[0]) : 0;

            // Sucht nach den unverkürzten Hashes im Text via regulärer Ausdrücke
            const idHashMatch = blockStr.match(/ID-Hash:\s*([a-fA-F0-9]{16,64})/);
            const prevHashMatch = blockStr.match(/Prev-Hash:\s*([a-fA-F0-9]{16,64})/);
            const currHashMatch = blockStr.match(/Curr-Hash:\s*([a-fA-F0-9]{16,64})/);
            
            const idHash = idHashMatch ? idHashMatch[1] : "Inaktiv / Nicht deklariert";
            const prevHash = prevHashMatch ? prevHashMatch[1] : "0000000000000000000000000000000000000000000000000000000000000000";
            const currHash = currHashMatch ? currHashMatch[1] : "Nicht versiegelt";

            // Holt den Typ des Blocks (z.B. LOGIN oder WALLET_EVALUATION)
            const typeMatch = blockStr.match(/\[(.*?)\]/);
            const blockType = typeMatch ? typeMatch[1] : "INTERAKTION";

            // Holt eventuelle Zusatzdetails
            const detailsMatch = blockStr.match(/•\s*(.*?)(?=\n|Prev-Hash|$)/);
            const blockDetails = detailsMatch ? detailsMatch[1] : "Aktion im Inland-Status verzeichnet.";

            // Zieht den Zeitstempel aus den eckigen Klammern am Anfang extrahiert heraus
            const timeMatch = blockStr.match(/^\[(.*?)\]/);
            const blockTime = timeMatch ? timeMatch[1] : "00:00:00";

            // Generiert das symmetrische, fraktale HTML-Layout im RAM
            finalHTML += `
                <div style="padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px dashed #334155;">
                    <strong style="color: #10b981;">[${blockTime}] ⛓️ Block #${blockIndex} [${blockType}]</strong><br>
                    <span style="color: #f8fafc;">• Details: ${blockDetails}</span><br>
                    
                    <!-- ID-HASH ZEILE -->
                    <div style="display: flex; justify-content: space-between; align-items: center; background: #090d16; padding: 6px 10px; border-radius: 4px; margin: 6px 0; gap: 10px; border: 1px solid #1e293b;">
                        <span style="color: #38bdf8; font-family: monospace; font-size: 11px; cursor: pointer; text-decoration: underline; flex: 1; word-break: break-all;" onclick="GlobalExplorer.inspect('${idHash}', 'ID', ${blockIndex})">ID-Hash: ${idHash}</span>
                        <button style="background: #334155; color: #f8fafc; border: 1px solid #475569; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; min-width: 38px;" onclick="GlobalExplorer.copyText('${idHash}')">📋</button>
                    </div>
                    
                    <!-- PREV-HASH ZEILE -->
                    <div style="display: flex; justify-content: space-between; align-items: center; background: #090d16; padding: 6px 10px; border-radius: 4px; margin: 6px 0; gap: 10px; border: 1px solid #1e293b;">
                        <span style="color: #38bdf8; font-family: monospace; font-size: 11px; cursor: pointer; text-decoration: underline; flex: 1; word-break: break-all;" onclick="GlobalExplorer.inspect('${prevHash}', 'PREV', ${blockIndex})">Prev-Hash: ${prevHash}</span>
                        <button style="background: #334155; color: #f8fafc; border: 1px solid #475569; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; min-width: 38px;" onclick="GlobalExplorer.copyText('${prevHash}')">📋</button>
                    </div>
                    
                    <!-- CURR-HASH ZEILE -->
                    <div style="display: flex; justify-content: space-between; align-items: center; background: #090d16; padding: 6px 10px; border-radius: 4px; margin: 6px 0; gap: 10px; border: 1px solid #1e293b;">
                        <span style="color: #38bdf8; font-family: monospace; font-size: 11px; cursor: pointer; text-decoration: underline; flex: 1; word-break: break-all;" onclick="GlobalExplorer.inspect('${currHash}', 'CURR', ${blockIndex})">Curr-Hash: ${currHash}</span>
                        <button style="background: #334155; color: #f8fafc; border: 1px solid #475569; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; min-width: 38px;" onclick="GlobalExplorer.copyText('${currHash}')">📋</button>
                    </div>
                </div>
            `;
        });

        // Überschreibt die Anzeige mit der neuen hochfunktionellen Fraktal-Struktur
        outputBox.innerHTML = finalHTML;
        outputBox.scrollTop = outputBox.scrollHeight;
    }
};
// ERWEITERUNGS-LOGIK: Überwacht das chain-output Feld permanent auf Datenänderungen durch die app.js
window.addEventListener('load', () => {
    if (typeof system !== 'undefined') {
        console.log("EuroChain-Kern erkannt. Modulares Explorer-System ist aktiv.");
        
        const targetNode = document.getElementById('chain-output');
        if (targetNode) {
            // Ein MutationObserver reagiert in Echtzeit, sobald Text in die Box geschüttet wird
            const observer = new MutationObserver(() => {
                // Verhindert Endlosschleifen beim Umschreiben

observer.disconnect();
GlobalExplorer.interceptAndTransform();
// Schaltet den Observer nach dem RAM-Umschreiben sofort wieder scharf
observer.observe(targetNode, { childList: true, characterData: true, subtree: true });
});
observer.observe(targetNode, { childList: true, characterData: true, subtree: true });
}
}
});
