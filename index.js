require('log-timestamp')
require('dotenv').config()

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
  var camActive = false;
  var randomCam;

  var babySinclairs = [
    'b1',
    'b2',
    'b3',
    'b4',
    'b5',
    'b6'
  ];

  var urkels = [
    'u1',
    'u2',
    'u3'
  ];

  var timAllens = [
    't1',
    't2',
    't3',
    't4'
  ];

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
    '!babysinclaircam',
    '!urkelcam',
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
    '!recipe',
    '!babysinclaircam',
    '!urkelcam',
    '!timallencam'
  ];

  var anagrams = [
    'URBANOLOGY DIET',
    'OBLIGATORY NUDE',
    'BLOODYING URATE',
    'AIRBOUND TOY LEG',
    'BUNGALOID TOYER',
    'LEGIONARY DOUBT',
    'URANOLOGY BIDET',
    'REGULATION DOBY'
  ];

  function onRewardHander (user, reward, cost, extra) {
    console.log(`****** ${user} redeemed ${reward} for ${cost} ******`);

    if (reward === 'Rod Anagram (1 DAY ONLY!)') {
      postRandomAnagram('#gametimetelevision');
    }
  }

  function onMessageHandler (target, context, msg, self) {
    console.log(target);
    console.log(`${context.username} - ${msg}`);
    const commandName = msg.trim().toLowerCase();

    if (randomCommandInvoked === true) {
      clearTimeout(randomCommand);
      randomCommandInvoked = false;
    }

    if (commandName === '!commands') {
      client.say(target, `The INNOVATIVE commands are: ${commands.join(', ')}`);
    }

    else if (commandName === '!recipe' && camActive === false) {
      obs
        .send('GetCurrentScene')
        .then(response => {
          if (response.name === "Main Pinball Scene" || response.name === "Face Cam") {
            showRecipe();
            setTimeout(hideRecipe, 10000);
          }
        });
    }

    else if (commandName === '!babysinclaircam' && camActive === false) {
      showAndHideCam(babySinclairs);
    }

    else if (commandName === '!urkelcam' && camActive === false) {
      showAndHideCam(urkels);
    }

    else if (commandName === '!timallencam' && camActive === false) {
      showAndHideCam(timAllens);
    }

    else if (commandName === '!acruelangelsthesis') {
      setScene('END');
    }

    if (randomCommandInvoked === false) {
      randomCommand = setTimeout(executeRandomCommand, 60000, target);
      randomCommandInvoked = true;
    }
  }

  function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
  }

  function postRandomAnagram (target) {
    var anagram = randomElementFromArray(anagrams);
    client.say(target, `DOUBLE GYRATION <=> ${anagram}`);
  }

  function showItem (item) {
    obs.send('SetSceneItemProperties', {
      'item': item,
      'visible': true
    });
  }

  function hideItem (item) {
    obs.send('SetSceneItemProperties', {
      'item': item,
      'visible': false
    });
  }

  function showAndHideCam (collection) {
    obs
      .send('GetCurrentScene')
      .then(response => {
        if (response.name === "Main Pinball Scene" || response.name === "Face Cam") {
          showRandomCamFromGame(collection);
          setTimeout(hideRandomCamFromGame, 10000);
        }
        else if (response.name === "Tiki Cam") {
          showRandomCamFromRecipe(collection);
          setTimeout(hideRandomCamFromRecipe, 10000);
        }
      });
  }

  function showRecipe () {
    camActive = true;
    showItem('recipe');
    hideItem('game');
  }

  function showRandomCamFromGame (arr) {
    camActive = true;
    randomCam = randomElementFromArray(arr);
    showItem(randomCam);
    hideItem('game');
  }

  function showRandomCamFromRecipe (arr) {
    camActive = true;
    randomCam = randomElementFromArray(arr);
    showItem(randomCam);
    hideItem('recipe');
  }

  function hideRecipe () {
    showItem('game');
    hideItem('recipe');
    camActive = false;
  }

  function hideRandomCamFromGame () {
    showItem('game');
    hideItem(randomCam);
    camActive = false;
  }

  function hideRandomCamFromRecipe () {
    showItem('recipe');
    hideItem(randomCam);
    camActive = false;
  }

  function setScene (sceneName) {
    obs.send('SetCurrentScene', {
      'scene-name': sceneName
    });
  }

  function randomElementFromArray (arr) {
    return arr[getRandomInt(arr.length)];
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  function executeRandomCommand (target) {
    const command = randomElementFromArray(randomCommands);
    client.say(target, command);
  }
});

obs.connect({ address: '10.0.1.57:4444', password: process.env.OBSPASSWORD});
