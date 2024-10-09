Messagerie en Temps Réel(basé sur Socketio) avec Chiffrement RSA - Documentation (PROJET TITAN)

1. Introduction
Cette fonctionnalité permet d'échanger des messages en temps réel entre utilisateurs avec chiffrement RSA pour garantir la sécurité des messages. Le backend est géré par Node.js et Socket.io, et le client utilise des clés publiques et privées pour le chiffrement/déchiffrement des messages.

Technologies utilisées :
Node.js
Socket.io
Express
Web Cryptography API pour le chiffrement RSA
Path pour la gestion des fichiers statiques

Entités dans le projet de messagerie
Cette partie du projet inclut deux principales entités : Message et User. Celles-ci évolueront avec le projet, permettant des modifications et personnalisations au fur et à mesure.

A- Message (message.js)

class Message {
    constructor(senderId, receiverId, content) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
        this.timestamp = new Date(); 
    }
}

senderId : L'ID de l'utilisateur envoyant le message.
receiverId : L'ID de l'utilisateur recevant le message.
content : Le contenu textuel du message.
timestamp : Définit automatiquement la date et l'heure de création du message.

B- User (user.js)

Les champs utilisateurs peuvent être personnalisés lors de l'intégration
class User {
    constructor(id, username, publicKey) {
        this.id = id;
        this.username = username;
        this.publicKey = publicKey;
        this.sessionId = null; 
    }

// AUTRES METHODES A VOIR DANS --> public/models/$(model).js
}

id : Identifiant unique de l'utilisateur.
username : Le nom d'utilisateur choisi.
publicKey : La clé publique assignée à l'utilisateur pour le chiffrement.
sessionId : Pour suivre les sessions actives de chaque utilisateur.
NB : Ces entités seront adaptées et modifiées au fur et à mesure des besoins du projet.

2. Architecture
Backend : Un serveur Node.js utilisant Socket.io pour gérer les connexions WebSocket et les échanges de messages. Les utilisateurs enregistrent une session avec une clé publique, qui est ensuite utilisée pour chiffrer les messages avant leur envoi.
CLIENT : Un client web qui démarre une session, génère une clé RSA, chiffre les messages avec la clé publique du destinataire et déchiffre les messages reçus avec la clé privée.

Schéma d'architecture :
Utilisateur A ---> [Chiffrement] ---> Serveur ---> [Déchiffrement] ---> Utilisateur B

3. Installation et Configuration
3.1 Prérequis
Node.js 
Socket.io (version 4.8.0)

3.2 Installation des Dépendances

npm install express socket.io path dotenv

3.3 Démarrage du Serveur
.env la variable PORT.Mais par défaut, le serveur s'exécute sur le port 3000.

4. Description des Composants
4.1 Backend (server.js)
Le fichier server.js gère les connexions WebSocket, l'enregistrement des sessions utilisateurs, et l'envoi/réception de messages.

Points principaux :
Connexion et déconnexion : Le serveur écoute les événements "connection" et "disconnect" de Socket.io.
Session utilisateur : Lors de la connexion, un utilisateur enregistre sa "clé publique" avec l'événement "register_session".
Envoi de messages : L'événement "send_message" permet à un utilisateur d'envoyer un message chiffré à un autre utilisateur. Le message est émis via l'événement "receive_message".

4.2 Frontend-Client (auth.js)
Le fichier auth.js contient la logique côté client pour gérer les clés RSA et la communication avec le serveur via Socket.io.

Fonctionnalités principales :

->Démarrage de session : Un utilisateur génère une clé RSA et enregistre sa session avec le serveur.

->Envoi de messages chiffrés : Le contenu du message est chiffré avec la clé publique du destinataire.
->Réception de messages chiffrés : Le client déchiffre les messages reçus à l'aide de sa clé privée.

4.3 Chiffrement/Déchiffrement (encryption.js)
Le fichier encryption.js gère les opérations de chiffrement et déchiffrement avec des clés RSA.

->encryptMessage : Chiffre le message avec la clé publique du destinataire.
->decryptMessage : Déchiffre le message avec la clé privée du récepteur.

Methodes encryptMessage | decryptMessage a voir dans public/encryption.js

async function encryptMessage(publicKeyPem, message) {
    const publicKey = await importPublicKey(publicKeyPem);
    const encodedMessage = new TextEncoder().encode(message);
    const encrypted = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, encodedMessage);
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

async function decryptMessage(privateKey, encryptedContent) {
    const encryptedArrayBuffer = base64ToArrayBuffer(encryptedContent);
    const decryptedMessage = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encryptedArrayBuffer);
    return new TextDecoder().decode(decryptedMessage);
}

5. Exécution et Test
->Plusieurs test ont été fait notamment avec les differents log en commentaires pour tout test Futur

5.1 Scénario de Test
Démarrer plusieurs sessions utilisateur dans différents onglets/navigateurs.
Envoi de message à un autre utilisateur.
Vérification : le message est reçu et déchiffré correctement.