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

  obs.on('SwitchScenes', data => {
    if (data['scene-name'] === 'Tiki Scene') {
      showMainCam(obs, 'recipe');
    }
    else if (data['scene-name'].startsWith('Main Pinball Scene') || data['scene-name'] === 'Face Scene') {
      showMainCam(obs, 'game');
    }
  });

  var commands = [
    '!red',
    '!aqua',
    '!blue',
    '!pink',
    '!green',
    '!orange',
    '!purple',
    '!yellow',
    '!setcolor #{6-DIGIT-HEX}',
    '!yabbadabbadoo',
    '!discord',
    '!recipe',
    '!game',
    '!fartson @{USERNAME}',
    '!kisses @{USERNAME}',
    '!leaderboard',
    '!tikikoncam'
  ];

  function onMessageHandler (target, context, msg, self) {
    console.log(`${context.username} - ${msg}`);
    const commandName = msg.trim().toLowerCase();

    if (commandName === '!commands') {
      client.say(target, `The INNOVATIVE commands are: ${commands.join(', ')}`);
    }

    if (commandName === '!recipe') {
      showRandomCam(obs, ['recipe']);
    }

    if (commandName === '!game') {
      showRandomCam(obs, ['game']);
    }

    if (commandName === '!tikikoncam') {
      client.say(target, `!yabbadabbaboo`);
      showRandomCam(obs, ['TPIR']);
    }

    if (commandName === '!discord') {
      client.say(target, `https://discord.gg/Z8dQREj`);
    }

    if (commandName === '!red' ||
      commandName === '!aqua' ||
      commandName === '!blue' ||
      commandName === '!pink' ||
      commandName === '!green' ||
      commandName === '!orange' ||
      commandName === '!purple' ||
      commandName === '!yellow'
    ) {
      setSidebarColor(obs, commandName);
    }

    if (commandName.startsWith('!setcolor')) {
      var arr = commandName.split('#');
      if (arr.length !== 1) {
        var hex = arr[arr.length - 1]
        var r = hex.substring(4, 6);
        var g = hex.substring(2, 4);
        var b = hex.substring(0, 2);
        hex = parseInt(`ff${r}${g}${b}`, 16);
        if (hex >= 4278190080 && hex <= 4294967295) {
          setSidebarColor(obs, hex)
        }
      }
    }

    if (commandName.startsWith('!kisses')) {
      let username = commandName.split('@')[1];

      if (username !== undefined) {
        showItemWithinScene(obs, 'kiss', '- Overlay');
        setTimeout(hideItemWithinScene, 1000, obs, 'kiss', '- Overlay');

        let bangs = bangers.get(username);
        bangers.set(username, (bangs || 0) + 1);
        bangs = bangers.get(username);

        client.say(target, `@${username} has been kissed ${bangs} time(s)`);
      }
    }

    if (commandName.startsWith('!fartson')) {
      let username = commandName.split('@')[1];

      if (username !== undefined) {
        showItemWithinScene(obs, 'fart', '- Overlay');
        setTimeout(hideItemWithinScene, 1000, obs, 'fart', '- Overlay');

        let bangs = bangers.get(username);
        bangers.set(username, (bangs || 0) - 1);
        bangs = bangers.get(username);

        client.say(target, `@${username} has been kissed ${bangs} time(s)`);
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
  }

  function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);

    hideItemWithinScene(obs, 'game', '- Sidebar Cam');
    hideItemWithinScene(obs, 'recipe', '- Sidebar Cam');

    setSidebarColor(obs, 4278190080);

    obs
      .send('GetCurrentScene')
      .then(response => {
        if (response.name === 'Tiki Scene') {
          showMainCam(obs, 'recipe');
        } else {
          showMainCam(obs, 'game');
        }
      });

    obs.send('SetSceneItemProperties', {
      'scene-name': '- Player Cam',
      'item': 'Player Cam',
      'scale': { 'x': 1.875, 'y': 1.875 },
      'position': { 'x': 0, 'y': 0 }
    });
  }
});

obs.connect({ address: '10.0.1.57:4444', password: process.env.OBSPASSWORD});
