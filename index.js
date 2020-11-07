require('log-timestamp');
require('dotenv').config();
require("./helpers.js")();
require("./obs-helpers.js")();
require("./scorbit.js")();
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
const fetch = require('node-fetch');

obs.on('ConnectionOpened', () => {
  console.log('* Connection Opened');
  client.on('message', onMessageHandler);
  client.on('connected', onConnectedHandler);
  client.connect();

  obs.on('SwitchScenes', data => {
    if (data['scene-name'] === 'Tiki Scene') {
      showMainCam(obs, 'recipe');
    }
    else if (data['scene-name'].startsWith('Main Pinball Scene') || data['scene-name'] === 'Face Scene') {
      showMainCam(obs, 'game');
    }
  });

  ComfyJS.onReward = onRewardHander;
  ComfyJS.Init('gametimetelevision', process.env.OAUTH);

  var randomCommand;
  var randomCommandInvoked = false;

  var frenzyActivated = false;
  var quizMonsterActive = false;
  var quizMonsterInterval;
  var answer;

  var maxBangs = 0;
  var bangerGrandChamp = null;
  var Map = require('sorted-map');
  var bangers = new Map();

  var babySinclairs = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'];
  var urkels = ['u1', 'u2', 'u3', 'u4', 'u5'];
  var timAllens = ['t1', 't2', 't3', 't4', 't5'];
  var toomgis = ['z1', 'z2', 'z3'];
  var rods = ['r1', 'r2', 'r3'];
  var goldenGirls = ['dorothy', 'dorothy', 'rose', 'sophia'];

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
    '!grittycam',
    '!timallencam',
    '!toomgiscam',
    '!urkelcam',
    '!rodcam',
    '!scorbit',
    '!leaderboard',
    '!grandchampion',
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
    '!grittycam',
    '!timallencam',
    '!toomgiscam',
    '!rodcam',
    '!urkelcam'
  ];

  initializeScorbit(obs);

  function onRewardHander (user, reward, cost, extra) {
    console.log(`****** ${user} redeemed ${reward} for ${cost} ******`);

    if (reward === 'Bananas on Rod and Les') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showItemWithinScene(obs, 'bananas', '- Player Cam');
      setTimeout(hideItemWithinScene, 10000, obs, 'bananas', '- Player Cam');
    }

    if (reward === 'Pokeball on Rod and Les') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showItemWithinScene(obs, 'pokeball', '- Player Cam');
      setTimeout(hideItemWithinScene, 10000, obs, 'pokeball', '- Player Cam');
    }

    if (reward === 'Phurba on Rod and Les') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
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

    if (commandName === '!recipe') {
      showRandomCam(obs, ['recipe']);
    }

    if (commandName === '!game') {
      showRandomCam(obs, ['game']);
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

    if (commandName === '!rodcam') {
      showRandomCam(obs, rods);
    }

    if (commandName === '!scorbit') {
      client.say(target, `The High Score brought to you by Scorbit: ${numberWithCommas(bestScore())}`);
      client.say(target, `The Low Score brought to you by Scorbit: ${numberWithCommas(worstScore())}`);
      client.say(target, `The Number of Games Played brought to you by Scorbit: ${gamesPlayed()}`);
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

    if (commandName === '!rodisthebugsbunnyoftwitch' && frenzyActivated === false) {
      client.say(target, `Frenzy brought to you by @zzzgodinezzz`);
      startFrenzy();
      setTimeout(stopFrenzy, 180000);

      quizMonsterInterval = setInterval(function() { startQuizMonster(target) }, 1000);
    }

    if (commandName === '!grandchampion' && bangerGrandChamp === null) {
      client.say(target, `No puppy has yet to bang`);
    }

    if (commandName === '!grandchampion' && bangerGrandChamp !== null) {
      let bangs = bangers.get(bangerGrandChamp);
      client.say(target, `@${bangerGrandChamp} is the current Grand Champion with ${bangs} bang(s)`);
    }

    if (commandName === '!leaderboard') {
      let startLength = bangers.length - 3;
      if (startLength < 0) { startLength = 0 };
      const leaders = bangers.slice(startLength, bangers.length)
      for (index = leaders.length-1; index >= 0; index--) {
        client.say(target, `@${leaders[index].key} - ${leaders[index].value} bang(s)`)
      }
    }

    if (commandName === `!${answer}` && quizMonsterActive === true) {
      let bangs = bangers.get(context.username);
      bangers.set(context.username, (bangs || 0) + 1);
      bangs = bangers.get(context.username);
      if (bangs > maxBangs) {
        maxBangs = bangs;
        bangerGrandChamp = context.username;
      }

      fetch("http://localhost:4567/1", {
        method: "POST",
        body: ''
      }).then(res => {
        console.log("Request complete! response:");
      });

      client.say(target, `@${context.username} has ${bangs} bang(s) under their belt`);
      stopQuizMonster();
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

  function startFrenzy() {
    frenzyActivated = true;
    showItemWithinScene(obs, '- Frenzy', '- Overlay');
  }

  function stopFrenzy() {
    clearInterval(quizMonsterInterval);

    hideItemWithinScene(obs, '- Frenzy', '- Overlay');
    stopQuizMonster();
  }

  function startQuizMonster() {
    if (quizMonsterActive === false && getRandomInt(2) === 0) {
      quizMonsterActive = true;
      answer = randomElementFromArray(goldenGirls);
      showItemWithinScene(obs, answer, '- Frenzy');
    }
  }

  function stopQuizMonster() {
    if (quizMonsterActive === true) {
      hideItemWithinScene(obs, answer, '- Frenzy');
      quizMonsterActive = false;
    }
  }
});

obs.connect({ address: '10.0.1.57:4444', password: process.env.OBSPASSWORD});
