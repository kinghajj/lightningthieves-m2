var sanitize = require('validator').sanitize;

/* Manages basic chat functionality. */
function Chat() {
  var self = this;
  self.registered = [];

  function calc_sender(socket) {
    return socket.handshake.address.address.toString()
  };

  function find_sender(sender) {
    console.log(self.registered);
    for(var i = 0; i < self.registered.length; i++) {
      if(self.registered[i].sender == sender) {
        console.log('found sender ' + sender);
        return i;
      }
    }
  }

  function find_nick(nick) {
    console.log(self.registered);
    for(var i = 0; i < self.registered.length; i++) {
      if(self.registered[i].nick == nick) {
        console.log('found nick ' + nick);
        return i;
      }
    }
  }

  self.initialize = function(conn, socket) {
    socket.on('disconnect', function() {
      var found = find_sender(calc_sender(socket));
      if(found !== undefined)
        self.registered.splice(found, 1);
    });
    socket.on('chat', function(pack) {
      var sender = calc_sender(socket);
      var msg    = sanitize(pack.msg).escape();
      var found  = find_sender(sender);
      if(found !== undefined) {
        sender = self.registered[found].nick;
      }
      conn.sockets.emit('chat', { sender: sender, msg: msg });
    });
    socket.on('check', function(pack) {
      var found = find_nick(pack.nick);
      if(found !== undefined) {
        socket.emit('nick-taken', pack);
      } else {
        socket.emit('nick-free', pack);
      }
    });
    socket.on('register', function(pack) {
      var found = find_nick(pack.nick);
      if(!found) {
        var sender = calc_sender(socket);
        console.log(sender);
        var found2 = find_sender(sender);
        console.log('found2 = ' + found2);
        if(found2 !== undefined) {
          console.log('changing nick');
          self.registered[found2].nick = pack.nick;
        } else {
          console.log('registering nick');
          self.registered.push({ sender: sender, nick: pack.nick });
        }
      }
    });
  };
}

module.exports = Chat;
