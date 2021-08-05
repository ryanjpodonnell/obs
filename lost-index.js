require('log-timestamp');
require('dotenv').config();
require("./helpers.js")();
require("./obs-helpers.js")();
require("./sidebar-cam.js")();

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

const OBSWebSocket = require('obs-websocket-js');
const obs = new OBSWebSocket();

const tmi = require('tmi.js');
const client = new tmi.client({
  identity: {
    username: 'dharma_os',
    password: process.env.DHARMAOAUTH
  },
  channels: [
    'twitchplaysthelostnumbers'
  ]
});

obs.on('ConnectionOpened', () => {
  console.log('* Connection Opened');
  client.on('message', onMessageHandler);
  client.on('connected', onConnectedHandler);
  client.connect();

  const Map = require('sorted-map');
  const bangers = new Map();

  let acceptInputBool = false;
  let endStreamTimer;

  const clocks = [
    'clock1',
    'clock2',
    'clock3',
    'clock4',
    'clock5',
    'clock6',
    'clock7',
    'clock8',
    'clock9',
    'clock10',
    'clock11',
    'clock12',
    'clock13',
    'clock14',
    'clock15',
    'clock16'
  ];

  function onMessageHandler (target, context, msg, self) {
    const username = context.username;
    const message = msg.trim().toLowerCase();
    console.log(`${username} - ${msg}`);

    if (message === '4 8 15 16 23 42' && acceptInputBool === true) {
      acceptInputBool = false;
      clearTimeout(endStreamTimer);

      setScene(obs, randomElementFromArray(clocks));
      setTimeout(acceptInput, 6266000);

      const bangs = bangers.get(username);
      bangers.set(username, (bangs || 0) + 1);
    }

    if (message === '!leaderboard') {
      let startLength = bangers.length - 3;
      if (startLength < 0) { startLength = 0 };
      const leaders = bangers.slice(startLength, bangers.length)
      for (let index = leaders.length-1; index >= 0; index--) {
        client.say(target, `@${leaders[index].key} - ${leaders[index].value}`)
      }
    }
  }

  function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);

    setScene(obs, randomElementFromArray(clocks));
    setTimeout(acceptInput, 6266000);
  }

  function acceptInput() {
    console.log('acceptInput');
    client.say('#twitchplaysthelostnumbers', '>:');
    acceptInputBool = true;

    endStreamTimer = setTimeout(endStream, 266000);
  }

  function endStream() {
    console.log('endStream');
    acceptInputBool = false;

    setScene(obs, 'clockend');
  }
});

obs.connect({address: 'localhost:4444', password: process.env.OBSPASSWORD});