(function () {
  "use strict";

  const terminal = document.getElementById("console");

  if (!terminal) {
    console.error("Padik terminal: element #console nebyl nalezen.");
    return;
  }

  const currentScript =
    document.currentScript ||
    Array.from(document.scripts).find(script =>
      script.src && script.src.includes("terminal.js")
    );

  if (!currentScript || !currentScript.src) {
    console.error("Padik terminal: nelze zjistit cestu k terminal.js.");
    return;
  }

  const baseUrl = new URL("./", currentScript.src).href;

  const terminalUser =
    terminal.getAttribute("user") ||
    terminal.dataset.user ||
    "host";

  const terminalServer =
    terminal.getAttribute("server") ||
    terminal.dataset.server ||
    "padikcom";

  const commandFiles = [
    "help.js",
    "clear.js",
    "pwd.js",
    "ls.js",
    "cd.js",
    "cat.js",
    "touch.js",
    "mkdir.js",
    "rm.js",
    "echo.js",
    "date.js",
    "whoami.js",
    "curl.js",
    "dig.js",
    "systemctl.js"
  ];

  window.PadikTerminalCommands = window.PadikTerminalCommands || {};

  function escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Nelze načíst: " + src));
      document.head.appendChild(script);
    });
  }

  async function loadCommands() {
    for (const file of commandFiles) {
      await loadScript(baseUrl + "commands/" + file);
    }
  }

  terminal.classList.add("padik-terminal");

  terminal.innerHTML = `
    <div class="terminal-top">
      <div class="dot red"></div>
      <div class="dot yellow"></div>
      <div class="dot green"></div>
      <div class="terminal-title"></div>
    </div>

    <div class="terminal-body">
      <div class="terminal-output"></div>

      <div class="terminal-input-line">
        <span class="prompt terminal-prompt"></span>
        <input
          class="terminal-input"
          type="text"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          aria-label="Terminálový příkaz"
        />
      </div>
    </div>
  `;

  if (!document.getElementById("padik-terminal-style")) {
    const style = document.createElement("style");
    style.id = "padik-terminal-style";
    style.textContent = `
      .padik-terminal{
        background:#050816;
        border-radius:20px;
        overflow:hidden;
        border:1px solid rgba(255,255,255,.12);
        box-shadow:0 25px 80px rgba(0,0,0,.45);
        max-width:100%;
      }

      .padik-terminal .terminal-top{
        padding:12px 16px;
        background:rgba(255,255,255,.07);
        display:flex;
        align-items:center;
        gap:8px;
      }

      .padik-terminal .terminal-title{
        margin-left:10px;
        font-family:Consolas,"Courier New",monospace;
        font-size:13px;
        color:#8aa0b8;
      }

      .padik-terminal .dot{
        width:12px;
        height:12px;
        border-radius:50%;
      }

      .padik-terminal .red{background:#ff5f56}
      .padik-terminal .yellow{background:#ffbd2e}
      .padik-terminal .green{background:#27c93f}

      .padik-terminal .terminal-body{
        min-height:420px;
        max-height:520px;
        overflow-y:auto;
        padding:24px;
        font-family:Consolas,"Courier New",monospace;
        color:#b9ffef;
        font-size:15px;
        line-height:1.75;
        cursor:text;
      }

      .padik-terminal .terminal-output{
        white-space:pre-wrap;
        word-break:break-word;
      }

      .padik-terminal .line{margin:0 0 6px}
      .padik-terminal .prompt{color:#38d5ff;margin-right:8px}
      .padik-terminal .success{color:#00ffd1;font-weight:bold}
      .padik-terminal .error{color:#ff6b6b}
      .padik-terminal .warning{color:#ffbd2e}
      .padik-terminal .muted{color:#7f8fa6}
      .padik-terminal .path{color:#c792ea}

      .padik-terminal .terminal-input-line{
        display:flex;
        align-items:center;
        margin-top:6px;
      }

      .padik-terminal .terminal-input{
        flex:1;
        background:transparent;
        border:none;
        outline:none;
        color:#b9ffef;
        font:inherit;
        min-width:80px;
        caret-color:#00ffd1;
      }

      @media(max-width:600px){
        .padik-terminal .terminal-body{
          font-size:13px;
          padding:18px;
          min-height:360px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const body = terminal.querySelector(".terminal-body");
  const output = terminal.querySelector(".terminal-output");
  const input = terminal.querySelector(".terminal-input");
  const prompt = terminal.querySelector(".terminal-prompt");
  const title = terminal.querySelector(".terminal-title");

  title.textContent = terminalUser + "@" + terminalServer + ": connected";

  let currentPath = "/home/padik";
  let history = [];
  let historyIndex = -1;
  let redirectInProgress = false;

  const fs = {
    "/home/padik": {
      type: "dir",
      children: {
        "readme.txt": {
          type: "file",
          content:
`Ahoj, já jsem Padik a ty jsi v mé konzoli.
Jak ses sem dostal?

Hlavně nemaž soubor:
/data/web/index.html`
        },

        "data": {
          type: "dir",
          children: {
            "web": {
              type: "dir",
              children: {
                "index.html": {
                  type: "file",
                  tooLarge: true,
                  content: "<!DOCTYPE html><html><body>Padik.eu</body></html>"
                },
                "style.css": {
                  type: "file",
                  content: "body { background:#050816; color:#fff; }"
                },
                "config.php": {
                  type: "file",
                  content: "<?php // fake configuration ?>"
                }
              }
            },

            "logs": {
              type: "dir",
              children: {
                "access.log": {
                  type: "file",
                  content:
`192.168.50.177 - GET / HTTP/2 200
192.168.50.174 - GET /wp-admin HTTP/2 302
127.0.0.1 - GET /server-status HTTP/1.1 200`
                },
                "error.log": {
                  type: "file",
                  content:
`[warning] suspicious terminal access detected
[notice] nginx reload complete`
                },
                "auth.log": {
                  type: "file",
                  content:
`sshd: Accepted password for ${terminalUser}
systemd-logind: New session opened`
                }
              }
            },

            "backup": {
              type: "dir",
              children: {
                "old-readme.txt": {
                  type: "file",
                  content: "Starý README soubor."
                },
                "secret-note.txt": {
                  type: "file",
                  content: "Nikdy nevěř konzoli, která se tváří moc opravdově."
                }
              }
            }
          }
        }
      }
    }
  };

  function addLine(html = "", className = "line") {
    const line = document.createElement("div");
    line.className = className;
    line.innerHTML = html;
    output.appendChild(line);
    body.scrollTop = body.scrollHeight;
  }

  function addRawLine(text = "", className = "line") {
    addLine(escapeHtml(text), className);
  }

  function displayPath(path) {
    if (path === "/home/padik") return "~";
    if (path.startsWith("/home/padik/")) {
      return "~" + path.substring("/home/padik".length);
    }
    return path;
  }

  function updatePrompt() {
    prompt.textContent =
      terminalUser + "@" + terminalServer + ":" +
      displayPath(currentPath) + "#";
  }

  function normalizePath(path) {
    let requested = String(path || "").trim();

    if (!requested) return currentPath;
    if (requested === "~") return "/home/padik";

    if (requested.startsWith("~/")) {
      requested = "/home/padik/" + requested.substring(2);
    } else if (requested === "/data") {
      requested = "/home/padik/data";
    } else if (requested.startsWith("/data/")) {
      requested = "/home/padik" + requested;
    } else if (!requested.startsWith("/")) {
      requested = currentPath + "/" + requested;
    }

    const parts = [];

    requested.split("/").forEach(part => {
      if (!part || part === ".") return;
      if (part === "..") {
        parts.pop();
        return;
      }
      parts.push(part);
    });

    return "/" + parts.join("/");
  }

  function getNode(path) {
    const rootPath = "/home/padik";

    if (path === rootPath) return fs[rootPath];
    if (!path.startsWith(rootPath + "/")) return null;

    const parts = path
      .substring(rootPath.length)
      .split("/")
      .filter(Boolean);

    let node = fs[rootPath];

    for (const part of parts) {
      if (
        !node ||
        node.type !== "dir" ||
        !node.children ||
        !Object.prototype.hasOwnProperty.call(node.children, part)
      ) {
        return null;
      }

      node = node.children[part];
    }

    return node;
  }

  function getParentAndName(path) {
    const parts = path.split("/").filter(Boolean);
    const name = parts.pop();

    return {
      parent: getNode("/" + parts.join("/")),
      name
    };
  }

  function listDirectory(path) {
    const node = getNode(path);

    if (!node) {
      addLine(
        "ls: cannot access '" + escapeHtml(displayPath(path)) +
        "': No such file or directory",
        "line error"
      );
      return;
    }

    if (node.type !== "dir") {
      addRawLine(displayPath(path));
      return;
    }

    const rendered = Object.keys(node.children || {})
      .map(name => {
        const item = node.children[name];

        return item.type === "dir"
          ? "<span class='path'>" + escapeHtml(name) + "/</span>"
          : escapeHtml(name);
      })
      .join("   ");

    if (rendered) addLine(rendered);
  }

  function simulateWebsiteCrash() {
    if (redirectInProgress) return;

    redirectInProgress = true;
    input.disabled = true;

    addLine('<span class="error">CRITICAL:</span> required website files were deleted');
    addLine('<span class="warning">nginx: document root is unavailable</span>');
    addLine('<span class="error">HTTP/1.1 500 Internal Server Error</span>');
    addLine('<span class="success">redirecting...</span>');

    setTimeout(() => {
      window.location.assign("https://padik.eu.xd/");
    }, 1800);
  }

  const context = {
    terminal,
    output,
    terminalUser,
    terminalServer,
    addLine,
    addRawLine,
    escapeHtml,
    displayPath,
    normalizePath,
    getNode,
    getParentAndName,
    listDirectory,
    updatePrompt,
    simulateWebsiteCrash,
    getCurrentPath: () => currentPath,
    setCurrentPath: path => {
      currentPath = path;
    }
  };

  function runCommand(command) {
    const name = String(command || "")
      .trim()
      .split(/\s+/)[0]
      .toLowerCase();

    if (!name) return;

    const handler = window.PadikTerminalCommands[name];

    if (!handler) {
      addLine(escapeHtml(name) + ": command not found", "line error");
      return;
    }

    handler(command, context);
  }

  function startupSimulation() {
    const mode = terminal.dataset.startup || "";
    const url = terminal.dataset.url || "/";

    if (mode === "website_connection") {
      addLine(
        '<span class="prompt">' +
        escapeHtml(terminalUser + "@" + terminalServer + ":~#") +
        "</span> curl -I https://padik.eu"
      );
      addRawLine("HTTP/2 200");
      addRawLine("server: nginx");
      addLine('<span class="success">✔ padik.eu is online</span>');
      addRawLine("");
    }

    if (mode === "error_404") {
      addLine(
        '<span class="prompt">' +
        escapeHtml(terminalUser + "@" + terminalServer + ":~#") +
        "</span> GET " +
        escapeHtml(url)
      );
      addRawLine("request: https://padik.eu" + url);
      addRawLine("hledaný soubor: /data/web" + url);
      addLine('<span class="error">HTTP/1.1 404 Not Found</span>');
      addRawLine("");
    }
  }

  input.addEventListener("keydown", event => {
    if (redirectInProgress) {
      event.preventDefault();
      return;
    }

    if (event.key === "Enter") {
      const command = input.value;
      input.value = "";

      if (command.trim()) {
        history.push(command);
        historyIndex = history.length;
      }

      addLine(
        '<span class="prompt">' +
        escapeHtml(prompt.textContent) +
        "</span> " +
        escapeHtml(command)
      );

      runCommand(command);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (!history.length) return;

      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex] || "";
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!history.length) return;

      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] || "";
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
    }
  });

  terminal.addEventListener("click", () => {
    if (!redirectInProgress) input.focus();
  });

  loadCommands()
    .then(() => {
      updatePrompt();
      startupSimulation();
      input.focus();
    })
    .catch(error => {
      addLine(
        '<span class="error">Nelze načíst příkazy:</span> ' +
        escapeHtml(error.message)
      );
      console.error(error);
    });
})();
