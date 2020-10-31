require('log-timestamp');
require('dotenv').config();
require("./helpers.js")();
require("./obs-helpers.js")();
require("./sidebar-cam.js")();

const ComfyJS = require('comfy.js');
const OBSWebSocket = require('obs-websocket-js');
const randomHexColor = require('random-hex-color');
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
  var urkels = ['u1', 'u2', 'u3', 'u4', 'u5'];
  var timAllens = ['t1', 't2', 't3', 't4', 't5'];
  var toomgis = ['z1', 'z2', 'z3'];
  var birds = ['J1', 'J2', 'J3', 'J4'];

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
    '!babysinclaircam',
    '!grittycam',
    '!urkelcam',
    '!toomgiscam',
    '!timallencam'
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
    '!setcolor',
    '!babysinclaircam',
    '!grittycam',
    '!urkelcam',
    '!toomgiscam',
    '!timallencam'
  ];

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

    if (reward === 'Phurba on Rod') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showItemWithinScene(obs, 'phurba-rod', '- Logi Rod');
      setTimeout(hideItemWithinScene, 30000, obs, 'phurba-rod', '- Logi Rod');
    }

    if (reward === 'Phurba on Les') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showItemWithinScene(obs, 'phurba-les', '- Logi Les');
      setTimeout(hideItemWithinScene, 30000, obs, 'phurba-les', '- Logi Les');
    }

    if (reward === 'Rod Do Something Funny') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showItemWithinScene(obs, 'funny', '- Logi Rod');
      setTimeout(hideItemWithinScene, 10000, obs, 'funny', '- Logi Rod');
    }

    if (reward === 'Rod Do Something Unfunny') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showItemWithinScene(obs, 'unfunny', '- Logi Rod');
      setTimeout(hideItemWithinScene, 10000, obs, 'unfunny', '- Logi Rod');
    }

    if (reward === "I'm A Scardy Widdle Baby") {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showItemWithinScene(obs, 'jumpscare', '- Sidebar Big');
      setTimeout(hideItemWithinScene, 10000, obs, 'jumpscare', '- Sidebar Big');
    }

    if (reward === 'Gimme A JUMPSCARE, Daddy!') {
      obs
        .send('GetCurrentScene')
        .then(response => {
          var scene = response.name;
          if (birds.includes(scene) === false) {
            var jumpscareTimeout = getRandomInt(60) * 1000;
            var returnTimeout = jumpscareTimeout + 4000;
            var randomJumpscare = randomElementFromArray(birds);

            client.say('#gametimetelevision', `!yabbadabbaboo`);
            setTimeout(setScene, jumpscareTimeout, obs, randomJumpscare);
            setTimeout(setScene, returnTimeout, obs, scene);
          }
        });
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

    if (commandName === '!babysinclaircam') {
      showRandomCam(obs, babySinclairs);
    }

    if (commandName === '!urkelcam') {
      showRandomCam(obs, urkels);
    }

    if (commandName === '!timallencam') {
      showRandomCam(obs, timAllens);
    }

    if (commandName === '!grittycam' || commandName === '!toomgiscam') {
      showRandomCam(obs, toomgis);
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
    var command = randomElementFromArray(randomCommands);
    if (command === '!setcolor') {
      command = `!setcolor${randomHexColor()}`;
    }

    client.say(target, command);
  }
});

obs.connect({ address: '10.0.1.57:4444', password: process.env.OBSPASSWORD});
