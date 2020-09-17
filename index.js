require('log-timestamp');
require('dotenv').config();
require("./helpers.js")();
require("./obs-helpers.js")();
require("./sidebar-cam.js")();

const ComfyJS = require('comfy.js');
const OBSWebSocket = require('obs-websocket-js');
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

  var randomCommand;
  var randomCommandInvoked = false;

  var babySinclairs = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'];
  var urkels = ['u1', 'u2', 'u3', 'u4'];
  var timAllens = ['t1', 't2', 't3', 't4'];
  var klumps = ['k1', 'k2', 'k3'];

  var commands = [
    '!red',
    '!aqua',
    '!blue',
    '!pink',
    '!green',
    '!orange',
    '!purple',
    '!yellow',
    '!yabbadabbadoo',
    '!babysinclaircam',
    '!urkelcam',
    '!timallencam',
    '!klumpscam',
    '!setcolor'
  ];

  var randomCommands = [
    '!red',
    '!aqua',
    '!blue',
    '!pink',
    '!green',
    '!orange',
    '!purple',
    '!yellow',
    '!babysinclaircam',
    '!urkelcam',
    '!timallencam',
    '!klumpscam'
  ];

  function onRewardHander (user, reward, cost, extra) {
    console.log(`****** ${user} redeemed ${reward} for ${cost} ******`);

    if (reward === 'Bananas on Rod') {
      client.say('#gametimetelevision', `!yabbadabbadoo`);
      showItemWithinScene(obs, 'bananas-left', '- Logi-Left');
      setTimeout(hideItemWithinScene, 10000, obs, 'bananas', '- Player Cam');
    }

    else if (reward === 'Bananas on Les') {
      client.say('#gametimetelevision', `!yabbadabbadoo`);
      showItemWithinScene(obs, 'bananas-right', '- Logi-Right');
      setTimeout(hideItemWithinScene, 10000, obs, 'bananas', '- Player Cam');
    }

    else if (reward === 'Pokeball on Rod') {
      client.say('#gametimetelevision', `!yabbadabbadoo`);
      showItemWithinScene(obs, 'pokeball-left', '- Logi-Left');
      setTimeout(hideItemWithinScene, 10000, obs, 'pokeball-left', '- Logi-Left');
    }

    else if (reward === 'Pokeball on Les') {
      client.say('#gametimetelevision', `!yabbadabbadoo`);
      showItemWithinScene(obs, 'pokeball-right', '- Logi-Right');
      setTimeout(hideItemWithinScene, 10000, obs, 'pokeball-right', '- Logi-Right');
    }
  }

  function onMessageHandler (target, context, msg, self) {
    console.log(`${context.username} - ${msg}`);
    const commandName = msg.trim().toLowerCase();

    if (randomCommandInvoked === true) {
      clearTimeout(randomCommand);
      randomCommandInvoked = false;
    }

    if (commandName === '!commands') {
      client.say(target, `The INNOVATIVE commands are: ${commands.join(', ')}`);
    }

    else if (commandName === '!babysinclaircam') {
      showRandomCam(obs, babySinclairs);
    }

    else if (commandName === '!urkelcam') {
      showRandomCam(obs, urkels);
    }

    else if (commandName === '!timallencam') {
      showRandomCam(obs, timAllens);
    }

    else if (commandName === '!klumpscam') {
      showRandomCam(obs, klumps);
    }

    else if (commandName === '!red' ||
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

    else if (commandName.startsWith('!setcolor')) {
      var arr = commandName.split('#');
      if (arr.length !== 1) {
        var hex = arr[arr.length - 1]
        console.log(`ff${hex}`);
        hex = parseInt(`ff${hex}`, 16)
        if (hex >= 4278190080 && hex <= 4294967295) {
          setSidebarColor(obs, hex)
        }
      }
    }

    if (randomCommandInvoked === false) {
      randomCommand = setTimeout(executeRandomCommand, 300000, target);
      randomCommandInvoked = true;
    }
  }

  function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);

    setSidebarColor(obs, 4278190080);
  }

  function executeRandomCommand (target) {
    const command = randomElementFromArray(randomCommands);
    client.say(target, command);
  }
});

obs.connect({ address: '10.0.1.57:4444', password: process.env.OBSPASSWORD});
