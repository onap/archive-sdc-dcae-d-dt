var http = require("http");
var url = require("url");
var fs = require("fs");

http.createServer(function(req, resp) {
  var file = url.parse(req.url).pathname.substring(1);

  console.log(file);
  if (!fs.existsSync(file)) {
    resp.writeHead(404, file + " foundn't");
    return resp.end();
  }

  try {
    fs.readFile(file, function(err, file) {
      if (err) {
        throw err;
      } else {
        resp.writeHead(200,
                       { 'Access-Control-Allow-Origin' : '*',
                         'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
                         'Access-Control-Allow-Headers': 'X-Requested-With,content-type',
                         'Access-Control-Allow-Credentials': true });
        resp.write(file);
        resp.end();
      }
    });
  } catch(e) {
    resp.writeHead(500,e);
    resp.end();
  }
}).listen(8999);
