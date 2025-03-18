/**
 * Custom server for Next.js with Socket.io integration
 * 
 * This server initializes both Next.js and the Socket.io server
 * to enable real-time communication for the chat system.
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initializeSocketServer } = require('@saasfly/chat/server');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.io server with the HTTP server
  initializeSocketServer(server);

  // Start the server
  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
