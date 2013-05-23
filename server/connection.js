/* Manages incoming socket.io connections. */
function Connection(sockets) {
  this.sockets = sockets;
  this.connection_count = 0;
  this.initializers = [];

  /* Handle a new connection. */
  this.handler = function(socket) {
    // keep track of the connection count
    this.connection_count++;
    socket.on('disconnect', function() {
      connection_count--;
    });
    socket.on('connection_count', function() {
      socket.emit('connection_count', { connection_count: connection_count });
    });
    // call initializers so they can add listeners
    for(var i in this.initializers) {
      this.initializers[i].initialize(this, socket);
    }
  }

  /* Add initializers to run on subsequent connections. */
  this.addInitializers = function(initializers) {
    for(var i in initializers) {
      this.initializers.push(new initializers[i]());
    }
  }

  // use any extra arguments as initializers
  this.addInitializers([].slice.call(arguments).slice(1));
}

module.exports = Connection;
