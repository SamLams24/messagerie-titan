/**
* METHODES : 'encryptMessage', 'decryptMessage', 'base64ToArrayBuffer', 'exportPublicKey', '?importPublicKey', 'str2ab'
**/

async function encryptMessage(publicKeyPem, message) {
    try {
        const publicKey = await importPublicKey(publicKeyPem);

        const encodedMessage = new TextEncoder().encode(message);
        
        const encrypted = await crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
            },
            publicKey,
            encodedMessage
        );

        // Retour du message chiffré en chaine de base64
        return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    } catch (error) {
        console.error('Attention ! Erreur lors du chiffrement :', error);
    }
}


//déchiffrer avec la clé Priv
async function decryptMessage(privateKey, encryptedContent) {

    try {

        const encryptedArrayBuffer = base64ToArrayBuffer(encryptedContent);

        const decryptedMessage = await window.crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            privateKey,
            encryptedArrayBuffer
        );

    const decodedMessage = new TextDecoder().decode(decryptedMessage);
    return decodedMessage;
    } catch(error) {
        console.error(' Attention ! Erreur lors du dechiffrement', error);
    }
     
}

// reconversion du texte base64 en tableau de buffer
function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64); 
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer; 
}

async function exportPublicKey(publicKey) {

    // export de la clé Pub
    const exportedKey = await window.crypto.subtle.exportKey("spki", publicKey);

    // Convertir de la clé a exporter en base64
    const base64Key = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));

    // Division de la clé en lignes de 64 caractères
    const pemKey = [];
    for (let i = 0; i < base64Key.length; i += 64) {
        pemKey.push(base64Key.substring(i, i + 64));
    }

    // On Encapsule la clé avec les balises sous format Pem
    return `-----BEGIN PUBLIC KEY-----\n${pemKey.join('\n')}\n-----END PUBLIC KEY-----`;
}

// our importer la clé recuperer
async function importPublicKey(pem) {

    // Suppression des en-tetes
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
    
    // Décoder la clé de base64
    const binaryDerString = atob(pemContents); // Possibilité de use Buffer.from()
    
    // Convertion de la chaîne en tableau d'octets
    const binaryDer = str2ab(binaryDerString);

    return crypto.subtle.importKey(
        "spki",
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: {name: "SHA-256"},
        },
        true,
        ["encrypt"]
    );
}

// Convertion string en buffer
function str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}


export { encryptMessage, decryptMessage, exportPublicKey };
