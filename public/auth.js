
import { encryptMessage, decryptMessage, exportPublicKey } from './encryption.js';
import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const socket = io();

//demarrons une session avec SocketIo
async function startSession(userId, username) {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]

    );

    const publicKey = await exportPublicKey(keyPair.publicKey);
    const privateKey = keyPair.privateKey;

    // Creation d'un User
    socket.emit('register_session', {id: userId, username, publicKey });

    //stockage de la clé Priv
    window.sessionPrivateKey = privateKey;

    return {userId, username, publicKey};
}

// Envoie
async function sendMessage(senderId, receiverId, content) {
    // Attente de la clé publique récupérée
    const receiverPublicKeyPem = await fetchReceiverPublicKey(receiverId);

    if (receiverPublicKeyPem) {
        const encryptedContent = await encryptMessage(receiverPublicKeyPem, content);
        
        if (encryptedContent) {
            // -->console.log(`Contenu crypté : ${encryptedContent}`);
            socket.emit('send_message', { senderId, receiverId, encryptedContent });
        } else {
            console.log('Erreur : encryptedContent est undefined');
        }
    } else {
        console.log(`Erreur : Impossible de récupérer la clé publique pour l'ID ${receiverId}`);
    }
}

// Réception
socket.on('receive_message', async (messageDto) => {
    // -->console.log('message recu :', JSON.stringify(messageDto, null, 2));

    try {
        const decryptedMessage = await decryptMessage(window.sessionPrivateKey, messageDto.encryptedContent)
        console.log('message déchiffré: ', decryptedMessage);
        // Autres traitements a faire suite a l'integration avec le client front
        // -->
        // Fin des Autres traitements a faire 
    } catch(error) {
        console.error('Erreur , Impossible de Dechiffrer le message :', error);
    }

});

// Recuperation de la clé Pu sur l'endP '/api/getPublicKey/:id'
async function fetchReceiverPublicKey(receiverId) {
    try {
        const response = await fetch(`/api/getPublicKey/${receiverId}`);
        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération de la clé publique pour l'ID ${receiverId}`);
        }
        const data = await response.json();
        return data.publicKey;
    } catch (error) {
        console.error('Erreur :', error);
    }
}

export { startSession, sendMessage};