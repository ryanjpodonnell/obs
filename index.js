require('log-timestamp');
require('dotenv').config();
require("./helpers.js")();
require("./obs-helpers.js")();
require("./sidebar-cam.js")();

const ComfyJS = require('comfy.js');
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

  ComfyJS.onReward = onRewardHander;
  ComfyJS.Init('gametimetelevision', process.env.OAUTH);

  var commands = [
    '!red',
    '!aqua',
    '!blue',
    '!pink',
    '!green',
    '!orange',
    '!purple',
    '!yellow',
    '!setcolor',
    '!yabbadabbadoo',
    '!discord',
    '!tikikoncam'
  ];
  var badBoys = [];

  function onRewardHander (user, reward, cost, extra) {
    console.log(`****** ${user} redeemed ${reward} for ${cost} ******`);

    if (reward === 'Bananas on Rod') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showItemWithinScene(obs, 'bananas-rod', '- Logi Rod');
      setTimeout(hideItemWithinScene, 10000, obs, 'bananas-rod', '- Logi Rod');
    }

    if (reward === 'Bananas on Les') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showItemWithinScene(obs, 'bananas-les', '- Logi Les');
      setTimeout(hideItemWithinScene, 10000, obs, 'bananas-les', '- Logi Les');
    }

    if (reward === 'Pokeball on Rod') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showItemWithinScene(obs, 'pokeball-rod', '- Logi Rod');
      setTimeout(hideItemWithinScene, 10000, obs, 'pokeball-rod', '- Logi Rod');
    }

    if (reward === 'Pokeball on Les') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showItemWithinScene(obs, 'pokeball-les', '- Logi Les');
      setTimeout(hideItemWithinScene, 10000, obs, 'pokeball-les', '- Logi Les');
    }

    if (reward === 'Rod Folds His Laundry') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
    }

    if (reward === 'ROD BIGGER') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      bigger(obs, '- Logi Rod', 'Logi-Left', 1920, 1080, 640, 360)
    }

    if (reward === 'rod smaller') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      smaller(obs, '- Logi Rod', 'Logi-Left', 1920, 1080, 640, 360)
    }

    if (reward === 'LES BIGGER') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      bigger(obs, '- Logi Les', 'Logi-Right', 1920, 1080, 640, 360)
    }

    if (reward === 'les smaller') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      smaller(obs, '- Logi Les', 'Logi-Right', 1920, 1080, 640, 360)
    }

    if (reward === 'ZMAC BIGGER') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      bigger(obs, '- Sidebar Big', 'zmac', 1920, 1080, 112, 112, false)
      bigger(obs, '- Sidebar', 'zmac', 1920, 1080, 112, 112, false)
    }

    if (reward === 'zmac smaller') {
      smaller(obs, '- Sidebar Big', 'zmac', 1920, 1080, 112, 112, false)
      smaller(obs, '- Sidebar', 'zmac', 1920, 1080, 112, 112, false)
    }
  }

  function onMessageHandler (target, context, msg, self) {
    console.log(`${context.username} - ${msg}`);
    const commandName = msg.trim().toLowerCase();

    if (badBoys.includes(context.username)) {
      fetch('http://localhost:4567/enqueue', {
        method: 'POST',
        body: JSON.stringify({ user: context.username, comment: escape(msg) }),
        headers: { 'Content-Type': 'application/json' }
      }).then(res => {
        client.deletemessage("gametimetelevision", context.id)
          .then((data) => {
            client.say('#gametimetelevision', `!yabbadabbaboo`);
            console.log('Request complete!');
          }).catch((err) => {
            console.log(err);
          });
      });
    }

    if (commandName.startsWith('!badboy') && context.username === 'gametimetelevision') {
      var badBoy = commandName.split(' ')[1];

      badBoys.push(badBoy);
      client.say('#gametimetelevision', `${badBoy} added to Bad Boy list`);
    }

    if (commandName.startsWith('!goodboy') && context.username === 'gametimetelevision') {
      var goodBoy = commandName.split(' ')[1];

      for (var i = 0; i < badBoys.length; i++) {
        if ( badBoys[i] === goodBoy) {
            badBoys.splice(i, 1);
        }
      }

      client.say('#gametimetelevision', `${goodBoy} removed from Bad Boy list`);
    }

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
  }

  function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);

    setSidebarColor(obs, 4278190080);

    obs.send('SetSceneItemProperties', {
      'scene-name': '- Sidebar Big',
      'item': 'zmac',
      'scale': { 'x': 1, 'y': 1 },
      'position': { 'x': 1808, 'y': 968 }
    })

    obs.send('SetSceneItemProperties', {
      'scene-name': '- Sidebar',
      'item': 'zmac',
      'scale': { 'x': 1, 'y': 1 },
      'position': { 'x': 1808, 'y': 968 }
    })

    obs.send('SetSceneItemProperties', {
      'scene-name': '- Logi Rod',
      'item': 'Logi-Left',
      'scale': { 'x': 5, 'y': 5 },
      'position': { 'x': -640, 'y': -360 }
    })

    obs.send('SetSceneItemProperties', {
      'scene-name': '- Logi Les',
      'item': 'Logi-Right',
      'scale': { 'x': 5, 'y': 5 },
      'position': { 'x': -640, 'y': -360 }
    })
  }
});

obs.connect({ address: '10.0.1.57:4444', password: process.env.OBSPASSWORD});
