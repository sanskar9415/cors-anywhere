// Listen on a specific host via the HOST environment variable
var host = process.env.HOST || '0.0.0.0';
// Listen on a specific port via the PORT environment variable
var port = process.env.PORT || 8080;

// Function to parse comma-separated environment variables into an array
function parseEnvList(env) {
  if (!env) {
    return [];
  }
  return env.split(',');
}

// Grab the whitelist from the environment variable
var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);

// Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
var checkRateLimit = require('./lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);

// Require cors-anywhere package
var cors_proxy = require('./lib/cors-anywhere');

// Create and start the CORS proxy server
cors_proxy.createServer({ 
  // Whitelist of allowed origins; empty array allows all origins
  originWhitelist: originWhitelist.length ? originWhitelist : [],

  // Optionally, you can set originBlacklist if you need to block specific origins
  originBlacklist: [],

  // Require these headers to be present in the request
  requireHeader: [],

  // Rate limiting configuration
  checkRateLimit: checkRateLimit,

  // Headers to be removed from the proxied request
  removeHeaders: [
    'cookie',
    'cookie2',
    'x-request-start',
    'x-request-id',
    'via',
    'connect-time',
    'total-route-time',
  ],

  // Redirect requests to the same origin if the origin matches
  redirectSameOrigin: true,

  // HTTP Proxy options
  httpProxyOptions: {
    // Do not add X-Forwarded-For, etc. headers
    xfwd: false,
  },
}).listen(port, host, function() {
  console.log('Running CORS Anywhere on ' + host + ':' + port);
});
