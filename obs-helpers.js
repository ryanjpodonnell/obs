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
}
