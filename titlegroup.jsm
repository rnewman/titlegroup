const EXPORTED_SYMBOLS = ["TitleGroup"];

const {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;

let TitleGroup = {
  sessionStore: Cc["@mozilla.org/browser/sessionstore;1"].getService(Ci.nsISessionStore),
  windowWatcher: Cc["@mozilla.org/embedcomp/window-watcher;1"].getService(Ci.nsIWindowWatcher),

  getMainWindow: function getMainWindow(window) {
    return window.QueryInterface(Ci.nsIInterfaceRequestor)
                     .getInterface(Ci.nsIWebNavigation)
                     .QueryInterface(Ci.nsIDocShellTreeItem)
                     .rootTreeItem
                     .QueryInterface(Ci.nsIInterfaceRequestor)
                     .getInterface(Ci.nsIDOMWindow); 
  },

  getGroupName: function getGroupName(window) {
    let groups = this.sessionStore.getWindowValue(window, "tabview-groups");
    if (!groups) {
      return;
    }
    let active = JSON.parse(groups).activeGroupId;
    let groupData = this.sessionStore.getWindowValue(window, "tabview-group");
    return JSON.parse(groupData)[active].title;
  },

  getTabBrowser: function getTabBrowser(mainWindow) {
    return mainWindow.document.getElementById("content");
  },

  getTitle: function getTitle(mainWindow) {
    return this.getTabBrowser(mainWindow).ownerDocument.title;
  },

  setTitle: function setTitle(mainWindow, title) {
    return this.getTabBrowser(mainWindow).ownerDocument.title = title;
  },

  getTabTitle: function getTabTitle(mainWindow) {
    return this.getTabBrowser(mainWindow).mCurrentBrowser.contentTitle;
  },

  computeTitle: function computeTitle(mainWindow) {
    let groupName = this.getGroupName(mainWindow);
    if (!groupName.length) {
      return;
    }
    let title = groupName + " : " + this.getTabTitle(mainWindow);
    return title;
  },

  updateTitle: function updateTitle(mainWindow, evt) {
    dump("Updating title on " + (evt ? evt.type : "null") + "\n");
    return this.setTitle(mainWindow, this.computeTitle(mainWindow));
  },

  /**
   * Returns an unloader function.
   */
  installWindowHandler: function installWindowHandler(window) {
    let mainWindow = this.getMainWindow(window);

    let gb   = mainWindow.gBrowser;
    let tc   = gb.tabContainer;
    let tabs = this.getTabBrowser(mainWindow);

    let handler = TitleGroup.updateTitle.bind(this, mainWindow);

    tabs.addEventListener("DOMTitleChanged", handler, false);
    tc.addEventListener("TabSelect", handler, false);
    gb.addEventListener("pageshow", handler, false);

    return function unloadWindowHandler() {
      tabs.removeEventListener("DOMTitleChanged", handler);
      tc.removeEventListener("TabSelect", handler);
      gb.removeEventListener("pageshow", handler);
    };
  }
};
