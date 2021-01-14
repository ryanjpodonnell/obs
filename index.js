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

  var jasons = ['ja1', 'ja2', 'ja3'];

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
    '!bobl',
    '!recipe',
    '!game',
    '!jasonalexander(notthatone)cam'
  ];

  function onRewardHander (user, reward, cost, extra) {
    console.log(`****** ${user} redeemed ${reward} for ${cost} ******`);

    if (reward === 'Jason Alexander Video of the Day') {
      obs
        .send('GetCurrentScene')
        .then(response => {
          var scene = response.name;
          if (scene !== 'JASON') {
            client.say('#gametimetelevision', `!yabbadabbaboo`);
            setScene(obs, 'JASON');
            setTimeout(setScene, 32000, obs, scene);
          }
        });
    }

    if (reward === 'Check in on Twin Peaks Season 2') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showRandomCam(obs, ['twinpeaks']);
    }
  }

  function onMessageHandler (target, context, msg, self) {
    console.log(`${context.username} - ${msg}`);
    const commandName = msg.trim().toLowerCase();

    if (commandName === 'execute iehack.krak' && context.username === 'iepinball') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showItemWithinScene(obs, 'hack', '- Poll');
      hideItemWithinScene(obs, 'jukebox', 'Tiki Scene');
      showItemWithinScene(obs, 'hacked jukebox', 'Tiki Scene');
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

    if (commandName === '!jasonalexander(notthatone)cam') {
      client.say('#gametimetelevision', `!yabbadabbaboo`);
      showRandomCam(obs, jasons);
    }

    if (commandName === '!bobl' || commandName === '!böbl') {
      client.say(target, `I am way better at Böbl than my man ChucklesW69. But you should follow him anyways.`);
      client.say(target, `http://twitch.tv/chucklesw73`);
      client.say(target, `https://morphcatgames.itch.io/bobl`);
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

    fetch("http://localhost:4567/enqueue", {
      method: "POST",
      body: JSON.stringify({ name: context.username, comment: escape(msg) }),
      headers: {'Content-Type': 'application/json'}
    }).then(res => {
      console.log("Request complete!");
    });
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
});

obs.connect({ address: '10.0.1.57:4444', password: process.env.OBSPASSWORD});
