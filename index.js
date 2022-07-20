require('log-timestamp');
require('dotenv').config();
require("./helpers.js")();
require("./obs-helpers.js")();
require("./sidebar-cam.js")();

const SortedMap = require('sorted-map');
const bangers = new SortedMap();

const OBSWebSocket = require('obs-websocket-js');
const obs = new OBSWebSocket();

const tmi = require('tmi.js');
const client = new tmi.client({
  identity: {
    username: 'roddog_hogbot',
    password: process.env.RODDOGPASSWORD
  },
  channels: [
    'gametimetelevision'
  ]
});

const commands = [
  '!red',
  '!aqua',
  '!blue',
  '!pink',
  '!green',
  '!orange',
  '!purple',
  '!yellow',
  '!setcolor #{6-DIGIT-HEX}',
  '!kisses @{USERNAME}',
  '!fartson @{USERNAME}',
  '!bestcountryintheworld',
  '!rodbigger',
  '!rodsmaller',
  '!pabsbigger',
  '!pabssmaller'
];

obs.on('ConnectionOpened', () => {
  console.log('* Connection Opened');
  client.on('message', onMessageHandler);
  client.on('connected', onConnectedHandler);
  client.connect();

  function onMessageHandler (target, context, msg, self) {
    console.log(`${context.username} - ${msg}`);
    const commandName = msg.trim().toLowerCase();

    if (commandName === '!commands') {
      client.say(target, `The INNOVATIVE commands are: ${commands.join(', ')}`);
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
        let bangs = bangers.get(username);
        bangers.set(username, (bangs || 0) + 1);

        showItemWithinScene(obs, 'kiss', '- Sidebar Thin');
        setTimeout(hideItemWithinScene, 1000, obs, 'kiss', '- Sidebar Thin');

        showItemWithinScene(obs, 'kiss', '- Sidebar Big');
        setTimeout(hideItemWithinScene, 1000, obs, 'kiss', '- Sidebar Big');
      }
    }

    if (commandName.startsWith('!fartson')) {
      let username = commandName.split('@')[1];

      if (username !== undefined) {
        let bangs = bangers.get(username);
        bangers.set(username, (bangs || 0) - 1);

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

    if (commandName === '!rodbigger') {
      bigger(obs, '- Logi Rod', 'Logi-Left', 1920, 1080, 1024, 576)
    }

    if (commandName === '!rodsmaller') {
      smaller(obs, '- Logi Rod', 'Logi-Left', 1920, 1080, 1024, 576)
    }

    if (commandName === '!pabsbigger') {
      bigger(obs, '- Logi Les', 'Logi-Right', 1920, 1080, 1024, 576)
    }

    if (commandName === '!pabssmaller') {
      smaller(obs, '- Logi Les', 'Logi-Right', 1920, 1080, 1024, 576)
    }

    if (commandName === '!bestcountryintheworld') {
      obs
        .send('GetCurrentScene')
        .then(response => {
          var scene = response.name;
          if (scene !== 'ozerik') {
            setScene(obs, 'ozerik');
            setTimeout(setScene, 60000, obs, scene);
          }
        });
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

obs.connect({ address: 'localhost:4444', password: process.env.OBSPASSWORD});