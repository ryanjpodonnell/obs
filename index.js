require('log-timestamp');
require('dotenv').config();
require("./scorbit.js")();
require("./obs-helpers.js")();

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
      showMainCam('recipe');
    }
    else if (data['scene-name'] === 'Main Pinball Scene' || data['scene-name'] === 'Face Scene') {
      showMainCam('game');
    }
  });

  ComfyJS.onReward = onRewardHander;
  ComfyJS.Init('gametimetelevision', process.env.OAUTH);

  var randomCommand;
  var randomCommandInvoked = false;
  var mainCam;
  var randomCam;
  var randomCamActive = false;
  var randomCamTimeout;

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
      showRandomCam(masks);
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
      showRandomCam(['recipe']);
    }

    else if (commandName === '!game') {
      showRandomCam(['game']);
    }

    else if (commandName === '!babysinclaircam') {
      showRandomCam(babySinclairs);
    }

    else if (commandName === '!urkelcam') {
      showRandomCam(urkels);
    }

    else if (commandName === '!timallencam') {
      showRandomCam(timAllens);
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

    obs
      .send('GetCurrentScene')
      .then(response => {
        if (response.name === 'Main Pinball Scene' || response.name === 'Face Scene') {
          mainCam = 'game';
        }
        else if (response.name === 'Tiki Scene') {
          mainCam = 'recipe';
        }
        else {
          mainCam = 'game';
        }

        showMainCam(mainCam);
      });
  }

  function showMainCam (cam) {
    if (randomCamActive === true) {
      hideItemWithinScene(obs, randomCam, '- Sidebar Cam');
      clearTimeout(randomCamTimeout);
    }
    hideItemWithinScene(obs, mainCam, '- Sidebar Cam');
    mainCam = cam;
    showItemWithinScene(obs, mainCam, '- Sidebar Cam');
  }

  function showRandomCam (arr) {
    if (randomCamActive === true) {
      hideItemWithinScene(obs, randomCam, '- Sidebar Cam');
      clearTimeout(randomCamTimeout);
    }

    hideItemWithinScene(obs, mainCam, '- Sidebar Cam');
    randomCam = randomElementFromArray(arr);
    showItemWithinScene(obs, randomCam, '- Sidebar Cam');
    randomCamActive = true;
    randomCamTimeout = setTimeout(hideRandomCam, 10000);
  }

  function hideRandomCam () {
    hideItemWithinScene(obs, randomCam, '- Sidebar Cam');
    showItemWithinScene(obs, mainCam, '- Sidebar Cam');
    randomCamActive = false;
  }

  function randomElementFromArray (arr) {
    return arr[getRandomInt(arr.length)];
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  function numberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function executeRandomCommand (target) {
    const command = randomElementFromArray(randomCommands);
    client.say(target, command);
  }
});

obs.connect({ address: '10.0.1.57:4444', password: process.env.OBSPASSWORD});
