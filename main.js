const { app, Menu, Tray, clipboard } = require('electron');
const { version } = require('./package.json');
const { Remote } = require('./remote');
const { MenuState } = require('./tray');


const SERVER = `${process.env.SERVER || "localhost:8100"}/${version}`;

const remote = new Remote(SERVER);

const menuState = new MenuState(remote);

remote.on('copy', (message) => {
    console.log(message);
    clipboard.writeText(message.content);
});

menuState.on('update', (menu) => {
    if (tray != null) {
        tray.setContextMenu(Menu.buildFromTemplate(menu));
    }
});

let lastContent = null;

(function () {
    setTimeout(function poll() {
        const content = clipboard.readText();
        if (content !== null && lastContent !== content) {
            lastContent = content;
            console.log('pasteboard change');
            remote.copy(lastContent)
        }
        setTimeout(poll, 500);
    }, 0);
})();



let tray = null;
app.on('ready', () => {
    tray = new Tray('./clipboard_white.png');

    if (app.dock) {
        app.dock.hide();
    }
});