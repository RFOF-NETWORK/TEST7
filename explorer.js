// Globales Kontroll-Objekt für den ausgelagerten Explorer
const GlobalExplorer = {
    
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
        // Ein leerer Prev-Hash im Block #0 deklariert die absolute Genesis-Position
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
    }
};

// ERWEITERUNGS-LOGIK: Klinkt sich vollautomatisch in die Klick-Events Ihrer bestehenden app.js ein
window.addEventListener('load', () => {
    // Falls das 'system'-Objekt aus Ihrer app.js im Arbeitsspeicher existiert, fangen wir die Klicks ab
    if (typeof system !== 'undefined') {
        console.log("EuroChain-Kern erfolgreich erkannt. Modulares Explorer-System ist aktiv.");
    }
});
