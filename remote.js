const { EventEmitter } = require('events');
const axios = require('axios');
const WebSocket = require('ws');

class Remote extends EventEmitter {
    constructor(url) {
        super()

        this.url = url;
        this.connect(`ws://${url}/events`);

        this.axios = axios.create({
            baseURL: `http://${url}`,
            timeout: 3000
        });
    }

    connect(url) {

        this.state = 'connecting';
        this.emit('state', this.state);

        this.ws = new WebSocket(url);

        this.ws.addEventListener('close', (code, reason) => {
            console.log(`ws.close(${code},${reason})`);
            this.connect();
            this.emit('state', this.state);
        });

        this.ws.addEventListener('open', () => {
            console.log('ws.open');
            this.state = 'online';
            this.emit('state', this.state);
        });

        this.ws.addEventListener('error', (error) => {
            console.log(`ws.error`);
            console.log(error);
        });

        this.ws.addListener('message', (data) => {
            const message = JSON.parse(data);
            console.log(message);
            if (message.event === 'copy') {
                this.emit('copy', message);
            }
        });
    }

    copy(content) {
        this.axios.post('/copy', JSON.stringify({content: content}), {
            headers: {
              'Content-Type': 'application/json'
            }
        }).then((response) => {
            console.log(response.data);
        }).catch((exception) => {
            console.log(exception);
        });
    }
}

exports.Remote = Remote