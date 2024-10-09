//Message Entity
class Message {

    constructor(senderId, receiverId, content) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
        this.timestamp = new Date; // heure et date d'emission ou de creation du dit message
    }
}

module.exports = Message;