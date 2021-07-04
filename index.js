require('log-timestamp');
require('dotenv').config();
require("./helpers.js")();
require("./obs-helpers.js")();
require("./sidebar-cam.js")();

const OBSWebSocket = require('obs-websocket-js');
const fetch = require('node-fetch');
const tmi = require('tmi.js');
const obs = new OBSWebSocket();
const client = new tmi.client({
  identity: {
    username: 'roddog_hogbot',
    password: process.env.RODDOGPASSWORD
  },
  channels: [
    'gametimetelevision'
  ]
});

obs.on('ConnectionOpened', () => {
  console.log('* Connection Opened');
  client.on('message', onMessageHandler);
  client.on('connected', onConnectedHandler);
  client.connect();

  var Map = require('sorted-map');
  var bangers = new Map();

  var commands = [
    '!kisses @{USERNAME}',
    '!fartson @{USERNAME}',
    '!monkeycam',
    '!bananas',
    '!spinningmonkey',
    '!ozerikhistoricalsmokersession'
  ];

  function onMessageHandler (target, context, msg, self) {
    console.log(`${context.username} - ${msg}`);
    const commandName = msg.trim().toLowerCase();

    if (commandName === '!commands') {
      client.say(target, `The INNOVATIVE commands are: ${commands.join(', ')}`);
    }

    if (commandName === '!monkeycam') {
      showRandomCam(obs, ['m1', 'm2', 'm3', 'm4', 'm5', 'm6']);
    }

    if (commandName.startsWith('!kisses')) {
      let username = commandName.split('@')[1];
      let bangs = bangers.get(username);
      bangers.set(username, (bangs || 0) + 1);

      if (username !== undefined) {
        showItemWithinScene(obs, 'kiss', '- Sidebar Thin');
        setTimeout(hideItemWithinScene, 1000, obs, 'kiss', '- Sidebar Thin');

        showItemWithinScene(obs, 'kiss', '- Sidebar Big');
        setTimeout(hideItemWithinScene, 1000, obs, 'kiss', '- Sidebar Big');
      }
    }

    if (commandName.startsWith('!fartson')) {
      let username = commandName.split('@')[1];
      let bangs = bangers.get(username);
      bangers.set(username, (bangs || 0) - 1);

      if (username !== undefined) {
        showItemWithinScene(obs, 'fart', '- Sidebar Thin');
        setTimeout(hideItemWithinScene, 1000, obs, 'fart', '- Sidebar Thin');

        showItemWithinScene(obs, 'fart', '- Sidebar Big');
        setTimeout(hideItemWithinScene, 1000, obs, 'fart', '- Sidebar Big');
      }
    }

    if (commandName === '!leaderboard') {
      let startLength = bangers.length - 3;
      if (startLength < 0) { startLength = 0 };
      const leaders = bangers.slice(startLength, bangers.length)
      for (index = leaders.length-1; index >= 0; index--) {
        client.say(target, `@${leaders[index].key} - ${leaders[index].value} kiss(es)`)
      }
    }

    if (commandName === '!bananas') {
      showItemWithinScene(obs, 'bananas', '- Game');
      setTimeout(hideItemWithinScene, 10000, obs, 'bananas', '- Game');
    }

    if (commandName === '!spinningmonkey') {
      showItemWithinScene(obs, 'monkey', '- Game');
      setTimeout(hideItemWithinScene, 10000, obs, 'monkey', '- Game');
    }

    if (commandName === '!ozerikhistoricalsmokersession') {
      obs
        .send('GetCurrentScene')
        .then(response => {
          var scene = response.name;
          if (scene !== 'ozerik') {
            setScene(obs, 'ozerik');
            setTimeout(setScene, 10000, obs, scene);
          }
        });
    }
  }

  function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);

    setSidebarColor(obs, 4278190080);

    setTimeout(executeRandomCommand, 100, obs);
  }

  function executeRandomCommand (obs) {
    const rndInt = Math.floor(Math.random() * 16777215) + 4278190080
    setSidebarColor(obs, rndInt)

    setTimeout(executeRandomCommand, 100, obs);
  }


});

obs.connect({ address: 'localhost:4444', password: process.env.OBSPASSWORD});
