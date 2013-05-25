var sanitize = require('validator').sanitize;

/* Manages basic chat functionality. */
function Chat() {
  var self = this;
  self.registered = [];

  function calc_sender(socket) {
    return socket.handshake.address.address.toString()
  };

  function find_sender(sender) {
    for(var i = 0; i < self.registered.length; i++) {
      if(self.registered[i].sender == sender) {
        return i;
      }
    }
  }

  function find_nick(nick) {
    for(var i = 0; i < self.registered.length; i++) {
      if(self.registered[i].nick == nick) {
        return i;
      }
    }
  }

  function nick_available(nick) {
    return nick_valid(nick) && find_nick(nick) === undefined;
  }

  function nick_valid(nick) {
    return nick && nick.match(/^[0-9a-zA-Z]+$/) !== null
  }

  function reg_nick(nick, socket) {
    if(!nick_available(nick))
      return;
    var sender = calc_sender(socket);
    var found = find_sender(sender);
    console.log('registering ' + nick + ' to ' + sender);
    if(found !== undefined) {
      self.registered[found].nick = nick;
    } else {
      self.registered.push({ sender: sender, nick: nick });
    }
  }

  function calc_name(socket) {
    var sender = calc_sender(socket);
    var found = find_sender(sender);
    console.log(found);
    console.log(self.registered[found].nick);
    return found !== undefined ? self.registered[found].nick : sender;
  }

  self.initialize = function(conn, socket) {
    socket.on('disconnect', function() {
      var found = find_sender(calc_sender(socket));
      if(found !== undefined)
        self.registered.splice(found, 1);
    });
    socket.on('chat', function(pack) {
      var name = calc_name(socket), msg = sanitize(pack.msg).escape();
      console.log('delivering message from ' + name + ': ' + msg);
      conn.sockets.emit('chat', { name: name, msg: msg });
    });
    socket.on('nick-chk', function(pack) {
      var avail = nick_available(pack.nick);
      socket.emit(avail ? 'nick-avail' : 'nick-invalid', pack);
    });
    socket.on('nick-reg', function(pack) {
      reg_nick(pack.nick, socket);
    });
  };
}

module.exports = Chat;
