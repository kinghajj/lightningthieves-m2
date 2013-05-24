/* Manages incoming socket.io connections. */
function Connection(sockets) {
  var self = this;

  self.sockets = sockets;
  self.connection_count = 0;
  self.initializers = [];

  /* Handle a new connection. */
  self.handler = function(socket) {
    // keep track of the connection count
    self.connection_count++;
    socket.on('disconnect', function() {
      self.connection_count--;
    });
    socket.on('connection_count', function() {
      socket.emit('connection_count', { connection_count: connection_count });
    });
    // call initializers so they can add listeners
    for(var i = 0; i < self.initializers.length; i++) {
      self.initializers[i].initialize(self, socket);
    }
  };

  /* Add initializers to run on subsequent connections. */
  self.addInitializers = function(initializers) {
    for(var i in initializers) {
      self.initializers.push(new initializers[i]());
    }
  };

  // use any extra arguments as initializers
  self.addInitializers([].slice.call(arguments).slice(1));
}

module.exports = Connection;
