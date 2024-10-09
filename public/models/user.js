// User Entity
// Les Champs utilisateurs pourrons etre personnalisés lors de l'integration(RAPPEL : verification a faire conformément au model de classe du projet)
class User {
    constructor(id, username, publicKey) {
        this.id = id;
        this.username = username;
        this.publicKey = publicKey;
        this.sessionId = null; // L'idée etant d'assigner une session a chaque utilisateur
    
    }

    // sessions et clés Pub

    setSessionId(sessionId) {
        this.sessionId = sessionId;
    }

    setPublicKey(publicKey) {
        this.publicKey = publicKey;
    }
}

module.exports = { User };