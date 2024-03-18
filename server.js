const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');


const app = express();
const port = 3000;
let fileName = '';
let fieldname = ''

app.use(cors()); // Enable CORS for all routes

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname); // Change the audio store folder to the current path
    },
    filename: function (req, file, cb) {
        fieldname = file.fieldname + '-' + Date.now()
        fileName = fieldname + path.extname(file.originalname);
        cb(null, fileName); // Use the original file name
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an audio file!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

app.post('/upload', upload.single('audio'), async (req, res) => {
    // const { filename } = req.file;
    const command = `whisper ./`+fileName+` --model small`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error executing whisper command:', error);
            return res.status(500).send('Error processing audio' + error.message);
        }

        exec(`cat ./` + fieldname + `.txt && rm ` + fieldname + `*`, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing cat command:', error);
                return res.status(500).send('Error retrieving transcription' + error.message);
            }

            console.log('Transcription result:', stdout);
            // You can save or process the transcription result as needed
            res.status(200).json({ transcription: stdout });
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


