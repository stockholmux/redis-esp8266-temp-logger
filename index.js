var
  argv              = require('yargs')                                // `yargs` is a argument intrepreter module
      .demand('credentials')                                          // we need the 'credentials' argument to setup the redis connection
      .argv,                                                          // return it back as an object
  express           = require('express'),                             // `express` is the web server module
  redis             = require('redis'),                               // `redis` (aka node_redis) is the module that manages the connection to the Redis instance
  redisCredentials  = require(argv.credentials),                      // `argv.credentials` is the path to the JSON object that is a node_redis config object

  client            = redis.createClient(redisCredentials),           // this is client instance of Redis, using the object pulled from the JSON config file
  app               = express(),                                      // our web server instance

  keys              = {                                               // keep our keys in a single object to reduce repetition
    temps : "temp-track"
  };

app.get('/temperatures/:start/:end',                                  // an HTTP GET request route - 'start' and 'end' are UNIX timestamps 
  function(req,res,next) {                                            // handler for the route
    client.zrangebylex(keys.temps,                                    // we'll get the range of the ZSET at `keys.temps`                              
      '['+req.params.start,                                           // the '[' indicates inclusive start...
      '['+req.params.end,                                             // and inclusive end
      function(err,resp) {
        if (err) { next(err); } else {                                // if `err` is set, we pass the err to `next` which will trigger an error HTTP response
          resp = resp.map(function(aPair) {                           // the results from Redis are not quite the way we need them
            var
              splitPair = aPair.split(':');                           // Our results are the unix timestamp concatenated with the temperature in C by a ':', so we need ot break them apart

          return [
              Number(splitPair[0])*1000,                              // Convert the String to a Number and multiply by 1000 to get a Javascript timestamp
              Number(splitPair[1])                                    // convert the temperature to a number
            ];
          });                                                         // While we have to do quite a bit of string manipulation, it seems to run quickly enough

          res.send(resp);                                             // The new array is sent back to HTTP
        }
      }
    );
  }
);

app
  .use(express.static('static'))                                      // the '/static' directory is served as flat files
  .listen(4999, function() {                                          // our HTTP server is listening on port 4999 
    console.log('Server running.');                                   // Tell the console all is well
  });