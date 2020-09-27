require('log-timestamp');
require('dotenv').config();
require("./helpers.js")();
require("./obs-helpers.js")();
require("./scorbit.js")();
require("./sidebar-cam.js")();

const ComfyJS = require('comfy.js');
const OBSWebSocket = require('obs-websocket-js');
const randomHexColor = require('random-hex-color')
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

  obs.on('SwitchScenes', data => {
    if (data['scene-name'] === 'Tiki Scene') {
      showMainCam(obs, 'recipe');
    }
    else if (data['scene-name'] === 'Main Pinball Scene' || data['scene-name'] === 'Face Scene') {
      showMainCam(obs, 'game');
    }
  });

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
    '!setcolor',
    '!yabbadabbadoo',
    '!recipe',
    '!game',
    '!babysinclaircam',
    '!urkelcam',
    '!timallencam',
    '!klumpscam',
    '!highscore',
    '!lowscore',
    '!gamesplayed'
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
    '!urkelcam',
    '!timallencam',
    '!klumpscam'
  ];

  initializeScorbit(obs);

  function onRewardHander (user, reward, cost, extra) {
    console.log(`****** ${user} redeemed ${reward} for ${cost} ******`);

    if (reward === 'Bananas on Rod and Les') {
      client.say('#gametimetelevision', `!yabbadabbadoo`);
      showItemWithinScene(obs, 'bananas', '- Player Cam');
      setTimeout(hideItemWithinScene, 10000, obs, 'bananas', '- Player Cam');
    }

    if (reward === 'Pokeball on Rod and Les') {
      client.say('#gametimetelevision', `!yabbadabbadoo`);
      showItemWithinScene(obs, 'pokeball', '- Player Cam');
      setTimeout(hideItemWithinScene, 10000, obs, 'pokeball', '- Player Cam');
    }

    if (reward === 'Phurba on Rod and Les') {
      client.say('#gametimetelevision', `!yabbadabbadoo`);
      showItemWithinScene(obs, 'phurba', '- Player Cam');
      setTimeout(hideItemWithinScene, 27000, obs, 'phurba', '- Player Cam');
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

    else if (commandName === '!recipe') {
      showRandomCam(obs, ['recipe']);
    }

    else if (commandName === '!game') {
      showRandomCam(obs, ['game']);
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

    else if (commandName === '!highscore') {
      client.say(target, `The High Score brought to you by Scorbit: ${numberWithCommas(bestScore())}`);
    }

    else if (commandName === '!lowscore') {
      client.say(target, `The Low Score brought to you by Scorbit: ${numberWithCommas(worstScore())}`);
    }

    else if (commandName === '!gamesplayed') {
      client.say(target, `The Number of Games Played brought to you by Scorbit: ${gamesPlayed()}`);
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
        var r = hex.substring(4, 6);
        var g = hex.substring(2, 4);
        var b = hex.substring(0, 2);
        hex = parseInt(`ff${r}${g}${b}`, 16)
        if (hex >= 4278190080 && hex <= 4294967295) {
          setSidebarColor(obs, hex)
        }
      }
    }

    if (randomCommandInvoked === false) {
      randomCommand = setTimeout(executeRandomCommand, 60000, target);
      randomCommandInvoked = true;
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
