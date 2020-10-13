const { app, Menu, Tray, clipboard } = require('electron');
const axios = require('axios');
const { version } = require('./package.json')
const WebSocket = require('ws');

const SERVER = `localhost:8100/${version}`;

const instance = axios.create({
    baseURL: `http://${SERVER}`,
    timeout: 3000
});

let lastContent = null;

const ws = new WebSocket(`ws://${SERVER}/events`);
console.log(ws.on)

ws.addListener('message', (data) => {
    const message = JSON.parse(data);
    console.log(message);
    if (message.event === 'copy') {
        if (message.content) {
            lastContent = message.content;
            clipboard.writeText(lastContent);
        }
    }
});

(function () {
    setTimeout(function poll() {
        const content = clipboard.readText();
        if (content !== null && lastContent !== content) {
            lastContent = content;
            console.log('post /copy');
            instance.post('/copy', JSON.stringify({content: lastContent}), {
                headers: {
                  // Overwrite Axios's automatically set Content-Type
                  'Content-Type': 'application/json'
                }
            }).then((response) => {
                console.log(response.data);
            }).catch((exception) => {
                console.log(exception);
            });
        }
        setTimeout(poll, 500);
    }, 0);
})();


let tray = null;
app.on('ready', () => {
    tray = new Tray('./clipboard_white.png');
    instance.get('/clipboard').then((response) => {
        console.log(response);
        const template = response.data.clipboard.map(function (item) {
            return {label: item, type: 'normal'}
        });
        const contextMenu = Menu.buildFromTemplate(template.length > 0 ? template : [
            { label: 'Empty', type: 'normal' }
        ]);
        tray.setContextMenu(contextMenu);
    }).catch((exception) => {
        console.log(exception);
    });

    if (app.dock) {
        app.dock.hide();
    }
});