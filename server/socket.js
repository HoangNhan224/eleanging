const { Server } = require('socket.io')

let io

function initSocket (server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    }
  })
  io.on('connection', (socket) => {
    console.log('WebSocket client connected:', socket.id)
  })
}

function broadcastRoleChangeWS (newRole, userId) {
  if (io) {
    io.emit('roleUpdated', { newRole, userId })
  }
}

function broadcastPermissionChangeWS (roleDescription) {
  if (io) {
    io.emit('permissionUpdated', { roleDescription })
  }
}

function broadcastNewNotification (userId, notificationDetails) {
  if (io) {
    io.emit('newNotification', { userId, notification: notificationDetails })
  }
}

module.exports = { initSocket, broadcastRoleChangeWS, broadcastPermissionChangeWS, broadcastNewNotification }
