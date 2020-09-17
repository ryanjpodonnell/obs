require('log-timestamp');
require('dotenv').config();
require("./helpers.js")();
require("./obs-helpers.js")();
require("./scorbit.js")();
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

  var frenzyActivated = false;

  var babySinclairs = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'];
  var urkels = ['u1', 'u2', 'u3'];
  var timAllens = ['t1', 't2', 't3', 't4'];
  var masks = ['m1', 'm2', 'm3', 'm4'];

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
    '!recipe',
    '!game',
    '!babysinclaircam',
    '!urkelcam',
    '!timallencam',
    '!bestscore',
    '!worstscore'
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
    '!recipe',
    '!game',
    '!babysinclaircam',
    '!urkelcam',
    '!timallencam'
  ];

  initializeScorbit(obs);

  function onRewardHander (user, reward, cost, extra) {
    console.log(`****** ${user} redeemed ${reward} for ${cost} ******`);

    if (reward === 'The Mask Cam (1 WEEK ONLY ACT NOW)') {
      showRandomCam(obs, masks);
    }

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

    else if (commandName === '!bestscore') {
      client.say(target, `The Best Score brought to you by Scorbit: ${numberWithCommas(bestScore())}`);
    }

    else if (commandName === '!worstscore') {
      client.say(target, `The Worst Score brought to you by Scorbit: ${numberWithCommas(worstScore())}`);
    }

    else if (commandName === '!roddogsecretcommand' && frenzyActivated === false) {
      client.say(target, `Frenzy brought to you by Scorbit`);
      frenzyActivated = true;
      startFrenzy();
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
    const command = randomElementFromArray(randomCommands);
    client.say(target, command);
  }
});

obs.connect({ address: '10.0.1.57:4444', password: process.env.OBSPASSWORD});
