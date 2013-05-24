var express     = require('express'),
    routes      = require('./server/routes'),
    connection  = require('./server/connection'),
    fetch       = require('./server/fetch'),
    chat        = require('./server/chat');

// Initialize Express, the HTTP server, and Socket.IO
var app = module.exports = express();
var srv = require('http').createServer(app);
var io  = require('socket.io').listen(srv);

// Configure the app
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

// Configure deployment settings
app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

// Configure the routes
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);
app.get('*', routes.index);

// Start the connection controllers
var conn = new connection(io.sockets, fetch, chat);
io.sockets.on('connection', conn.handler);

// Start listening
srv.listen(process.env.PORT || 3000, function() {
  console.log("%s server listening on port %d", app.settings.env, this.address().port);
});
