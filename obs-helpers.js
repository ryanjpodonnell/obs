module.exports = function() { 
  this.showItemWithinScene = function (obs, item, scene) {
    obs.send('SetSceneItemProperties', {
      'item': item,
      'scene-name': scene,
      'visible': true
    });
  };

  this.hideItemWithinScene = function (obs, item, scene) {
    obs.send('SetSceneItemProperties', {
      'item': item,
      'scene-name': scene,
      'visible': false
    });
  };

  this.showItem = function (obs, item) {
    obs.send('SetSceneItemProperties', {
      'item': item,
      'visible': true
    });
  }

  this.hideItem = function (obs, item) {
    obs.send('SetSceneItemProperties', {
      'item': item,
      'visible': false
    });
  }

  this.setScene = function (obs, sceneName) {
    obs.send('SetCurrentScene', {
      'scene-name': sceneName
    });
  }

  this.setSidebarColor = function (obs, color) {
    var colorId;

    if (color === '!red') {
      colorId = 4279900884;
    } else if (color === '!aqua') {
      colorId = 4291874360;
    } else if (color === '!blue') {
      colorId = 4286654229;
    } else if (color === '!pink') {
      colorId = 4285212592;
    } else if (color === '!green') {
      colorId = 4278611986;
    } else if (color === '!orange') {
      colorId = 4279666156;
    } else if (color === '!purple') {
      colorId = 4285338940;
    } else if (color === '!yellow') {
      colorId = 4282105542;
    } else {
      colorId = color
    }

    obs.send('SetSourceSettings', {
      'sourceName': 'PICK BG COLOR',
      'sourceType': 'color_source_v2',
      'sourceSettings': { 'color': colorId }
    });
  }

  this.bigger = function(obs, sceneName, item, basePositionX, basePositionY, baseWidth, baseHeight, centered = true) {
    let width = null;
    let height = null;
    let scaleX = null;
    let scaleY = null;
    let positionX = null;
    let positionY = null;

    showItemWithinScene(obs, 'bassoon', sceneName);
    setTimeout(hideItemWithinScene, 5000, obs, 'bassoon', sceneName);

    obs.send('GetSceneItemProperties', {
      'scene-name': sceneName,
      'item': item,
    }).then(data => {
      scaleX = (Math.round(data.scale.x * 10) / 10) + 0.1;
      scaleY = (Math.round(data.scale.y * 10) / 10) + 0.1;
      width = Math.floor(baseWidth * scaleX);
      height = Math.floor(baseHeight * scaleY);
      if (centered === true) {
        positionX = (basePositionX - width) / 2.0;
        positionY = (basePositionY - height) / 2.0;
      } else {
        positionX = (basePositionX - width);
        positionY = (basePositionY - height);
      }

      obs.send('SetSceneItemProperties', {
        'scene-name': sceneName,
        'item': item,
        'scale': { 'x': scaleX, 'y': scaleY },
        'position': { 'x': positionX, 'y': positionY }
      });
    });
  }

  this.smaller = function(obs, sceneName, item, basePositionX, basePositionY, baseWidth, baseHeight, centered = true) {
    let width = null;
    let height = null;
    let scaleX = null;
    let scaleY = null;
    let positionX = null;
    let positionY = null;

    showItemWithinScene(obs, 'sparkle', sceneName);
    setTimeout(hideItemWithinScene, 5000, obs, 'sparkle', sceneName);

    obs.send('GetSceneItemProperties', {
      'scene-name': sceneName,
      'item': item,
    }).then(data => {
      scaleX = (Math.round(data.scale.x * 10) / 10) - 0.1;
      scaleY = (Math.round(data.scale.y * 10) / 10) - 0.1;
      width = Math.floor(baseWidth * scaleX);
      height = Math.floor(baseHeight * scaleY);
      if (centered === true) {
        positionX = (basePositionX - width) / 2.0;
        positionY = (basePositionY - height) / 2.0;
      } else {
        positionX = (basePositionX - width);
        positionY = (basePositionY - height);
      }

      if (scaleX > 0 && scaleY > 0) {
        obs.send('SetSceneItemProperties', {
          'scene-name': sceneName,
          'item': item,
          'scale': { 'x': scaleX, 'y': scaleY },
          'position': { 'x': positionX, 'y': positionY }
        });
      }
    });
  }
}
