const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { exec } = require('child_process');

const app = express();
const port = 3000;


app.use(cors()); // Enable CORS for all routes

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname); // Change the audio store folder to the current path
    },
    filename: function (req, file, cb) {
        // const fileName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
        // cb(null, fileName);
        cb(null, file.originalname); // Use the original file name
    },
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('audio'), async (req, res) => {
    const { filename } = req.file;
    const command = `whisper ./${filename} --model small`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error executing whisper command:', error);
            return res.status(500).send('Error processing audio');
        }

        exec('cat ./recorded_audio.txt', (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing cat command:', error);
                return res.status(500).send('Error retrieving transcription');
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
