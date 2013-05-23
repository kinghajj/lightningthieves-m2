var sanitize = require('validator').sanitize;

function Chat() {
  this.initialize = function(conn, socket) {
    socket.on('chat', function(pack) {
      var sender = socket.handshake.address.address.toString();
      var msg    = sanitize(pack.msg).escape();
      conn.sockets.emit('chat', { sender: sender, msg: msg });
    });
  };
}

module.exports = Chat;
