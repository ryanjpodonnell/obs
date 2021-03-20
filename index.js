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
    '!kisses @{USERNAME}',
    '!fartson @{USERNAME}',
    '!tikikoncam'
  ];

  function onMessageHandler (target, context, msg, self) {
    console.log(`${context.username} - ${msg}`);
    const commandName = msg.trim().toLowerCase();

    if (commandName === '!commands') {
      client.say(target, `The INNOVATIVE commands are: ${commands.join(', ')}`);
    }

    if (commandName === '!discord') {
      client.say(target, `https://discord.gg/Z8dQREj`);
    }

    if (commandName === '!tikikoncam') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showRandomCam(obs, ['TPIR']);
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
        showItemWithinScene(obs, 'kiss', '- Sidebar');
        setTimeout(hideItemWithinScene, 1000, obs, 'kiss', '- Sidebar');

        showItemWithinScene(obs, 'kiss', '- Sidebar Big');
        setTimeout(hideItemWithinScene, 1000, obs, 'kiss', '- Sidebar Big');

        let bangs = bangers.get(username);
        bangers.set(username, (bangs || 0) + 1);
        bangs = bangers.get(username);

        client.say(target, `@${username} has been kissed ${bangs} time(s)`);
      }
    }

    if (commandName.startsWith('!fartson')) {
      let username = commandName.split('@')[1];

      if (username !== undefined) {
        showItemWithinScene(obs, 'fart', '- Sidebar');
        setTimeout(hideItemWithinScene, 1000, obs, 'fart', '- Sidebar');

        showItemWithinScene(obs, 'fart', '- Sidebar Big');
        setTimeout(hideItemWithinScene, 1000, obs, 'fart', '- Sidebar Big');

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

    setSidebarColor(obs, 4278190080);

    obs.send('SetSceneItemProperties', {
      'scene-name': '- Logi Rod',
      'item': 'Logi-Left',
      'scale': { 'x': 3, 'y': 3 },
      'position': { 'x': -576, 'y': -324 }
    })

    obs.send('SetSceneItemProperties', {
      'scene-name': '- Logi Les',
      'item': 'Logi-Right',
      'scale': { 'x': 3, 'y': 3 },
      'position': { 'x': -576, 'y': -324 }
    })
  }
});

obs.connect({ address: '10.0.1.57:4444', password: process.env.OBSPASSWORD});
