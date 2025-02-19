function generateRoomId() {
    return crypto.randomUUID().split('-')[0]; // Shorten the UUID
}
module.exports = {generateRoomId}
  