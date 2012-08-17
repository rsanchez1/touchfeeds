var Feeder = Feeder || {}
Feeder.fadeInTimeout = 0;
Feeder.fadeOutTimeout = 0;
Feeder.notification = null;

//Feeder.Metrix = new Metrix()

Feeder.notify = function(message) {
  //Mojo.Controller.getAppController().showBanner({messageText: message}, "", "feeder")
  if (!window.PalmSystem) {
      if (!!window.webkitNotifications) {
          clearTimeout(Feeder.fadeInTimeout);
          try {
              Feeder.notification.cancel();
          } catch(e) {
          }
          Feeder.notification = window.webkitNotifications.createNotification("icon.png", "TouchFeeds", message);
          Feeder.notification.show();
          Feeder.fadeInTimeout = setTimeout(function() {Feeder.notification.cancel();}, 5000);
      } else {
          Feeder.showBannerMessage(message);
      }
  } else {
      enyo.windows.addBannerMessage(message, "{}");
  }
}

Feeder.showBannerMessage = function(message) {
    clearTimeout(Feeder.fadeInTimeout);
    clearTimeout(Feeder.fadeOutTimeout);
    enyo.log("SHOWING BANNER MESSAGE");
    enyo.log(message);
    document.getElementById("touchfeedsBannerMessage").innerHTML = message;
    document.getElementById("touchfeedsBannerMessage").style.zIndex = "105";
    document.getElementById("main").style.bottom = "45px";
    Feeder.fadeIn();
}

Feeder.fadeIn = function(val) {
    if (typeof val == "undefined") {
        val = 0;
    }
    val += (1/62.5);
    document.getElementById("touchfeedsBannerMessage").style.opacity = "" + (val * val);
    if (val < 1) {
        Feeder.fadeInTimeout = setTimeout(Feeder.fadeIn.bind(this, val), 16);
    } else {
        Feeder.fadeOutTimeout = setTimeout(Feeder.fadeOut, 2000);
    }
}

Feeder.fadeOut = function(val) {
    if (typeof val == "undefined") {
        val = 1;
    }
    val -= (1/62.5);
    document.getElementById("touchfeedsBannerMessage").style.opacity = "" + (val * val);
    if (val > 0) {
        Feeder.fadeOutTimeout = setTimeout(Feeder.fadeOut.bind(this, val), 16);
    } else {
        document.getElementById("touchfeedsBannerMessage").style.opacity = "0";
        document.getElementById("touchfeedsBannerMessage").style.zIndex = "-1";
        document.getElementById("main").style.bottom = "0px";
    }
}

Feeder.Event = {
  refreshWanted: "feeder-refresh",
  refreshComplete: "feeder-refresh-complete"
}
