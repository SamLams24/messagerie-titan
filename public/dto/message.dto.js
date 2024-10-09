// dtoMesage

class MessageDTO {
    constructor(senderId, receiverId, encryptedContent) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.encryptedContent = encryptedContent;
    }
}

module.exports = MessageDTO;