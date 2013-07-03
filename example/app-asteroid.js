var asteroid = require('asteroid')
    , app = module.exports = asteroid();

var StorageService = require('../');

// expose a rest api
app.use(asteroid.rest());

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
});

var handler = new StorageService({provider: 'filesystem', root: '/tmp/storage'});

app.service('storage', handler);

app.get('/', function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    var form = "<html><body><h1>Storage Service Demo</h1>" +
        "<a href='/download'>List all containers</a><p>" +
        "Upload to container c1: <p>" +
        "<form method='POST' enctype='multipart/form-data' action='/upload/c1'>"
        + "File to upload: <input type=file name=uploadedFiles multiple=true><br>"
        + "Notes about the file: <input type=text name=note><br>"
        + "<input type=submit value=Upload></form>" +
        "</body></html>";
    res.send(form);
    res.end();
});

app.post('/upload/:container', function (req, res, next) {
    handler.upload(req, res, function (err, result) {
        if (!err) {
            res.setHeader('Content-Type', 'application/json');
            res.send(200, result);
        } else {
            res.send(500, err);
        }
    });
});

app.get('/download', function (req, res, next) {
    handler.getContainers(function (err, containers) {
        var html = "<html><body><h1>Containers</h1><ul>";
        containers.forEach(function (f) {
            html += "<li><a href='/download/" + f.name + "'>" + f.name + "</a></li>"
        });
        html += "</ul><p><a href='/'>Home</a></p></body></html>";
        res.send(200, html);
    });
});

app.get('/download/:container', function (req, res, next) {
    handler.getFiles(req.params.container, function (err, files) {
        var html = "<html><body><h1>Files in container " + req.params.container + "</h1><ul>";
        files.forEach(function (f) {
            html += "<li><a href='/download/" + f.container + "/" + f.name + "'>" + f.container + "/" + f.name + "</a></li>"
        });
        html += "</ul><p><a href='/'>Home</a></p></body></html>";
        res.send(200, html);
    });
});

app.get('/download/:container/:file', function (req, res, next) {
    handler.download(req, res, function (err, result) {
        if (err) {
            res.send(500, err);
        }
    });
});

app.listen(app.get('port'));
console.log('http://127.0.0.1:' + app.get('port'));