const { EventEmitter } = require('events');

class Menu extends EventEmitter {
    constructor(remote) {
        super();
        remote.on('state', (state) => {
            this.emit('update', [{
                label: state,
                type: 'normal'
            }, {
                label: 'clipboard',
                type: 'normal'
            }])
        });
    }
}

exports.MenuState = Menu