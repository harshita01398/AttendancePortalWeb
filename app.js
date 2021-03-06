var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    formidable = require('formidable'),
    readChunk = require('read-chunk'),
    fileType = require('file-type'),
    bodyParser = require("body-parser"),
    {PythonShell} = require('python-shell');

var img="";

var app = express();

app.set('port', (process.env.PORT || 5000));

// Tell express to serve static files from the following directories
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())

if (process.env.NODE_ENV === 'production') {
	app.use(express.static('client/build'));
}

/**
 * Index route
 */
app.get('/', function (req, res) {
    // Don't bother about this :)
    var filesPath = path.join(__dirname, 'uploads/');
    fs.readdir(filesPath, function (err, files) {
        if (err) {
            console.log(err);
            return;
        }

        files.forEach(function (file) {
            fs.stat(filesPath + file, function (err, stats) {
                if (err) {
                    console.log(err);
                    return;
                }

                var createdAt = Date.parse(stats.ctime),
                    days = Math.round((Date.now() - createdAt) / (1000*60*60*24));

                if (days > 1) {
                    fs.unlink(filesPath + file);
                }
            });
        });
    });

    res.sendFile(path.join(__dirname, 'views/index.html'));
    console.log("here");
});

/**
 * Upload photos route.
 */
app.post('/upload_photos', function (req, res) {
    var photos = [],
        form = new formidable.IncomingForm();

    // Tells formidable that there will be multiple files sent.
    form.multiples = true;
    // Upload directory for the images
    form.uploadDir = path.join(__dirname, 'tmp_uploads');

    // Invoked when a file has finished uploading.
    form.on('file', function (name, file) {
        // Allow only 3 files to be uploaded.
        if (photos.length === 1) {
            fs.unlink(file.path);
            return true;
        }

        var buffer = null,
            type = null,
            filename = '';

        // Read a chunk of the file.
        buffer = readChunk.sync(file.path, 0, 262);
        // Get the file type using the buffer read using read-chunk
        type = fileType(buffer);

        // Check the file type, must be either png,jpg or jpeg
        if (type !== null && (type.ext === 'png' || type.ext === 'jpg' || type.ext === 'jpeg')) {
            // Assign new file name
            filename = Date.now() + '-' + file.name;

            // Move the file with the new file name
            fs.rename(file.path, path.join(__dirname, 'uploads/' + filename), function(err) {
                if (err) {
                    console.log(err);
                    return;
                }
            });

            // Add to the list of photos
            photos.push({
                status: true,
                filename: filename,
                type: type.ext,
                publicPath: 'uploads/' + filename
            });
            // img = 'uploads/' + filename;
        } else {
            photos.push({
                status: false,
                filename: file.name,
                message: 'Invalid file type'
            });
            fs.unlink(file.path);
        }
    });

    form.on('error', function(err) {
        console.log('Error occurred during processing - ' + err);
    });

    // Invoked when all the fields have been processed.
    form.on('end', function() {
        console.log('All the request fields have been processed.');
    });

    // Parse the incoming form fields.
    form.parse(req, function (err, fields, files) {
        res.status(200).json(photos);
    });
});


app.post('/generate_xls',function(req,res) {
    req.setTimeout(0);
    console.log(req.body.img);
    let img = "./";
    img += req.body.img;
    console.log(img);
    
    var options = {
        scriptPath: "./",
        args: img
      };
      
      PythonShell.run('Testing.py',options, function (err, results) {
        
        if (err) 
        res.send(err);
        // Results is an array consisting of messages collected during execution
        console.log(results);
        // var file = __dirname + '/Output/Result.xls';
        res.send(results);
      });
});

app.get('/download',function(req,res){
    var fileop = path.join(__dirname, 'Output/Result.xlsx');
    res.setHeader('Content-disposition', 'attachment; filename=Result.xlsx');
    res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.download(fileop,'Result.xlsx');
});


app.get('*', (request, response) => {
	response.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(app.get('port'), function() {
    console.log('Express started at port ' + app.get('port'));
});
