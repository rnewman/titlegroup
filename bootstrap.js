const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

let GLOBAL_SCOPE = this;

function startup(data, reason) {
  Cu.import("resource://gre/modules/Services.jsm");
  Services.scriptloader.loadSubScript(data.resourceURI.spec + "pullstarter.js",
                                      GLOBAL_SCOPE);

  PullStarter.registerResourceHost("titlegroup", data);
  Cu.import("resource://titlegroup/titlegroup.jsm");

  PullStarter.watchWindows("navigator:browser", function (window) {
    let unloader = TitleGroup.installWindowHandler(window);
    PullStarter.registerUnloader(unloader, window);
  });
}
