const express = require('express');
const app = express();
const mqtt = require('mqtt');
const bodyParser = require('body-parser');
const fs = require('fs');
const mqttClient = mqtt.connect('mqtt://0.0.0.0:1883');
const port = 3000;

let PublishedAlerts = [];
let UnpublishedAlerts = [];

const errorLogFile = 'filter.log'

let time = Math.floor(Date.now() / 1000); // initial time in seconds (integer)

// Function to update the time variable every 5 minutes
setInterval(() => {
    time = Math.floor(Date.now() / 1000); // Update time in seconds
    console.log(`Updated time: ${time}`);
}, 5 * 60 * 1000); // 5 minutes in milliseconds

async function PublishAlert() {
    while (UnpublishedAlerts.length > 0) {
        const alert = UnpublishedAlerts.shift();
        await publishToMQTT(alert);
    }
}

function publishToMQTT(alert) {
    return new Promise((resolve, reject) => {
        mqttClient.publish('wazuh/alerts', JSON.stringify(alert), (err) => {
            if (err) {
                var err_pub = 'Gagal mempublikasikan alert:' + err
                fs.appendFile(errorLogFile, err_pub + '\n', (err) => {
                    if (err) throw err;
                    console.log('Gagal mempublikasikan alert: ${err}');
                })
                reject(err);
            } else {
                var publish = 'Alert dipublikasikan:' + alert
                fs.appendFile(errorLogFile, publish + '\n', (err) => {
                    if (err) throw err;
                    console.log('Alert dipublikasikan:', alert);
                })
                PublishedAlerts.push(alert);
                resolve();
            }
        });
    });
}

function isDuplicateAlert(newAlert, alertList) {
    return alertList.some(alert => JSON.stringify(alert) === JSON.stringify(newAlert));
}

app.use(bodyParser.json());
app.post('/wazuh-alerts', async function requestHandler(req, res){
    try {
        const alertdata = req.body;
        const alertlevel = alertdata.level;

        if (!isDuplicateAlert(alertlevel, PublishedAlerts)) {
            UnpublishedAlerts.push(alertlevel);
            console.log('Alert:', UnpublishedAlerts);

           // if (UnpublishedAlerts.length === 1) {
           //     await PublishAlert();
           // }
           await PublishAlert();
        } else {
            sudah_publish = 'Alert sudah dipublish sebelumnya, tidak dipublish lagi:' + alertlevel;
            fs.appendFile(errorLogFile, sudah_publish + '\n', (err) => {
                if (err) throw err;
                console.log('Alert sudah dipublish sebelumnya, tidak dipublish lagi:', alertlevel);
            })
        }

        res.status(200).send('Alerts:' + alertlevel);
    } catch (error) {
        console.error('Kesalahan dalam penanganan permintaan POST:', error);
        res.status(500).send('Kesalahan dalam server');
    }
});

setInterval(() => {
    pesan = 'Reset PublishedAlerts';
    fs.appendFile(errorLogFile, pesan + '\n', (err) => {
        if (err) throw err;
        console.log('Reset PublishedAlerts');
    })
    PublishedAlerts = [];
}, 1 * 60 * 1000);

app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
});

mqttClient.on('connect', () => {
    console.log('Terhubung ke broker MQTT');
});

mqttClient.on('error', (err) => {
    console.error('Kesalahan MQTT:', err);
});


