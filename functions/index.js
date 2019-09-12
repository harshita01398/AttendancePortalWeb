var express = require('express'),
    path = require('path'),
    cors = require('cors'),
    fs = require('fs'),
    formidable = require('formidable'),
    readChunk = require('read-chunk'),
    fileType = require('file-type'),
    bodyParser = require("body-parser"),
    {PythonShell} = require('python-shell');

var config = {
    apiKey: "AIzaSyAojKFd4W_9jWYdwFeEZ4oSZxjWGMn4_R0",
    authDomain: "excal-916e3.firebaseapp.com",
    databaseURL: "https://excal-916e3.firebaseio.com",
    projectId: "excal-916e3",
    storageBucket: "excal-916e3.appspot.com",
    messagingSenderId: "715149724507",
    appId: "1:715149724507:web:064c225dd5558e039f287e"
    };    
var firebase = require("firebase/app");
firebase.initializeApp(config);

var functions = require('firebase-functions');
var storage =  require('firebase-storage');
var storageRef = storage.ref();

const app = express();
app.use(cors({ origin: true }));


app.post('/upload_photos', (req, res) => {
    var form = new formidable.IncomingForm();


    // Invoked when a file has finished uploading.
    form.on('file', function (name, file) {
        // Allow only 1 file to be uploaded.
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

        /*// Check the file type, must be either png,jpg or jpeg
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
        }*/
        var uploadTask = ref.put(buffer).then(function(snapshot) {
            console.log('Uploaded a blob or file!');
            return null;
          });

          uploadTask.on('state_changed', function(snapshot){
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case firebase.storage.TaskState.PAUSED: // or 'paused'
                console.log('Upload is paused');
                break;
              case firebase.storage.TaskState.RUNNING: // or 'running'
                console.log('Upload is running');
                break;
            }
          }, function(error) {
            // Handle unsuccessful uploads
            console.log("Unsuccessful");
          }, function() {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
              console.log('File available at', downloadURL);
              return null;
            }).catch(error => {
                console.log('Error', error);
            });
          });
    });

    form.on('error', function(err) {
        console.log('Error occurred during processing - ' + err);
    });

    // Invoked when all the fields have been processed.
    form.on('end', function() {
        console.log('All the request fields have been processed.');
    });

    // Parse the incoming form fields.
    form.parse(req, function (fields, files) {
        res.status(200).json(photos);
    });
});


