"use strict";

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
    let groups = sessionStore.getWindowValue(window, "tabview-groups");
    if (!groups) {
      return;
    }
    let active = JSON.parse(groups).activeGroupId;
    let groupData = sessionStore.getWindowValue(window, "tabview-group");
    return JSON.parse(groupData)[active].title;
  },

  getTabBrowser: function getTabBrowser(mainWindow) {
    return mainWindow.document.getElementById("content");
  },

  getTitle: function getTitle(mainWindow) {
    return this.getTabBrowser(mainWindow).ownerDocument.title;
  },

  setTitle: function setTitle(mainWindow, title) {
    this.getTabBrowser(mainWindow).ownerDocument.title = title;
  },

  getTabTitle: function getTabTitle(mainWindow) {
    return this.getTabBrowser(mainWindow).mCurrentBrowser.contentTitle;
  },

  updateTitle: function updateTitle(mainWindow) {
    this.setTitle(mainWindow, getGroupName(mainWindow) + " : " + getTabTitle(mainWindow));
  },

  installWindowHandler: function installWindowHandler(window) {
    let mainWindow = this.getMainWindow(window);
    let handler = this.updateTitle.bind(this, mainWindow);
    let tabs = this.getTabBrowser(mainWindow);
    tabs.addEventListener("DOMTitleChanged", handler, false);

    // This doesn't work.
    // tabs.addEventListener("pageshow", handler, false);
  }
}
