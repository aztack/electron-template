// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  send: (channel: string, data: object) => {
    // whitelist channels
    let validChannels = ["toMain"];
    if (validChannels.indexOf(channel) >= 0) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel: string, func: (...args: any) => void) => {
    let validChannels = ["fromMain"];
    if (validChannels.indexOf(channel) >= 0) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event: string, ...args: any[]) => func(...args));
    }
  },
});

// TODO: Remove following code
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) {
      element.innerText = text;
    }
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(
      `${type}-version`,
      process.versions[type as keyof NodeJS.ProcessVersions]
    );
  }
});
