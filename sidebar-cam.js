module.exports = function() { 
  require("./helpers.js")();
  require("./obs-helpers.js")();

  var mainCam;
  var randomCam;
  var randomCamActive = false;
  var randomCamTimeout;

  this.showMainCam = function (obs, cam) {
    if (mainCam === undefined) {
      mainCam = cam;
    }

    else if (randomCamActive === true) {
      hideItemWithinScene(obs, randomCam, '- Sidebar Cam');
      clearTimeout(randomCamTimeout);

      if (mainCam === cam) {
        showItemWithinScene(obs, mainCam, '- Sidebar Cam');
      } else {
        mainCam = cam;
        showItemWithinScene(obs, mainCam, '- Sidebar Cam');
      }
    }

    else if (randomCamActive === false && mainCam !== cam) {
      hideItemWithinScene(obs, mainCam, '- Sidebar Cam');
      mainCam = cam;
    }

    showItemWithinScene(obs, mainCam, '- Sidebar Cam');
  }

  this.showRandomCam = function (obs, arr) {
    if (mainCam === undefined) {
      return
    }

    if (randomCamActive === true) {
      hideItemWithinScene(obs, randomCam, '- Sidebar Cam');
      clearTimeout(randomCamTimeout);
    } else {
      hideItemWithinScene(obs, mainCam, '- Sidebar Cam');
    }

    randomCam = randomElementFromArray(arr);
    showItemWithinScene(obs, randomCam, '- Sidebar Cam');
    randomCamActive = true;
    randomCamTimeout = setTimeout(hideRandomCam, 10000, obs);
  }

  hideRandomCam = function (obs) {
    hideItemWithinScene(obs, randomCam, '- Sidebar Cam');
    showItemWithinScene(obs, mainCam, '- Sidebar Cam');
    randomCamActive = false;
  }
};
