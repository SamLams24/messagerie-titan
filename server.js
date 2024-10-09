/** 
 * INFOS DU SERVEUR 
 * TYPES D'APPEL EMIT : { 'connection', 'register_session', 'session_registered', 'send_message', 'receive_message', 'disconnect'}
 * SERVICES EXTERNES : http | express | socket io | path |
 * ROUTES : '/api/getPublicKey/:receiverId' --> Pour recup de la clé Pub |
**/

require('dotenv').config();

const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { User } = require('./public/models/user');
const Message = require('./public/models/message');
const UserDTO = require('./public/dto/user.dto');
const MessageDTO = require('./public/dto/message.dto');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

const users = {}; // Pour stocker les utilisateurs

// pour traiter les requêtes JSON
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// Route pour récupérer la clé publique d'un User
app.get('/api/getPublicKey/:receiverId', (req, res) => {
    const receiverId = req.params.receiverId;

    if (!users[receiverId]) {
        return res.status(404).json({ error: 'Erreur : Utilisateur non trouvé' });
    }

    const receiverPublicKey = users[receiverId].publicKey;
    res.json({ publicKey: receiverPublicKey });
});

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
    console.log('Nouvelle Connexion Utilisateur:', socket.id);

    // Enregistrement d'une Nouvelle session utilisateur avec la clé publique
    socket.on('register_session', ({ id, username, publicKey }) => {
        const user = new User(id, username, publicKey);
        users[id] = user;
        user.setSessionId(socket.id);

        // Retour d'un DTO user au Client --> Traitements possibles cotés Client : Affichages , etc
        const userDto = new UserDTO(user.id, user.username, user.publicKey);
        socket.emit('session_registered', userDto);
        console.log(`Utilisateur enregistré avec la session ID: ${socket.id}`);
    });

    // Envoi de message à un autre utilisateur
    socket.on('send_message', ({ senderId, receiverId, encryptedContent }) => {
        const sender = users[senderId];
        //console.log(sender);
        const receiver = users[receiverId];
        //console.log(receiver);
        if (!sender || !receiver) {
            return socket.emit('error', "L'expéditeur ou le destinataire du message est introuvable !");
        }
        
        const message = new Message(senderId, receiverId, encryptedContent);
        // Envoi au destinataire
        const messageDto = new MessageDTO(message.senderId, message.receiverId, message.content);
        if (messageDto.encryptedContent) {
            console.log('emit effectuée, messageDto :', JSON.stringify(messageDto, null, 2));
        } else {
            console.error('Erreur : encryptedContent undefined ');
        }
        io.to(receiver.sessionId).emit('receive_message', messageDto);
        // A supprimer si non necessaire en Production
        console.log(`Message envoyé du user ${senderId} au user ${receiverId}`);
    });

    //déconnexion d'un utilisateur
    socket.on('disconnect', () => {
        console.log('Utilisateur déconnecté:', socket.id);
    });
});

// Lancement du serveur
server.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
