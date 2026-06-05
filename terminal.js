(function () {
  const terminal = document.getElementById("console");

  if (!terminal) {
    console.error("Padik terminal: element #console nebyl nalezen.");
    return;
  }

  /*
   * Nastavení konzole.
   *
   * Lze použít:
   * user="host"
   * server="padikcom"
   *
   * Nebo:
   * data-user="host"
   * data-server="padikcom"
   *
   * Výchozí hodnoty:
   * host@padikcom
   */
  const terminalUser =
    terminal.getAttribute("user") ||
    terminal.dataset.user ||
    "host";

  const terminalServer =
    terminal.getAttribute("server") ||
    terminal.dataset.server ||
    "padikcom";

  function escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function escapeAttribute(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  terminal.classList.add("padik-terminal");

  terminal.innerHTML = `
    <div class="terminal-top">
      <div class="dot red"></div>
      <div class="dot yellow"></div>
      <div class="dot green"></div>

      <div class="terminal-title">
        ${escapeAttribute(terminalUser)}@${escapeAttribute(terminalServer)}: connected
      </div>
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

  /*
   * CSS vložíme jen jednou, i když by na stránce byl skript
   * omylem načten vícekrát.
   */
  if (!document.getElementById("padik-terminal-style")) {
    const style = document.createElement("style");
    style.id = "padik-terminal-style";

    style.textContent = `
      .padik-terminal {
        background:#050816;
        border-radius:20px;
        overflow:hidden;
        border:1px solid rgba(255,255,255,0.12);
        box-shadow:0 25px 80px rgba(0,0,0,.45);
        max-width:100%;
      }

      .padik-terminal .terminal-top {
        padding:12px 16px;
        background:rgba(255,255,255,0.07);
        display:flex;
        align-items:center;
        gap:8px;
      }

      .padik-terminal .terminal-title {
        margin-left:10px;
        font-family:Consolas, "Courier New", monospace;
        font-size:13px;
        color:#8aa0b8;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }

      .padik-terminal .dot {
        width:12px;
        height:12px;
        border-radius:50%;
        flex:0 0 auto;
      }

      .padik-terminal .red {
        background:#ff5f56;
      }

      .padik-terminal .yellow {
        background:#ffbd2e;
      }

      .padik-terminal .green {
        background:#27c93f;
      }

      .padik-terminal .terminal-body {
        min-height:420px;
        max-height:520px;
        overflow-y:auto;
        padding:24px;
        font-family:Consolas, "Courier New", monospace;
        color:#b9ffef;
        font-size:15px;
        line-height:1.75;
        cursor:text;
      }

      .padik-terminal .terminal-output {
        white-space:pre-wrap;
        word-break:break-word;
      }

      .padik-terminal .line {
        margin:0 0 6px;
      }

      .padik-terminal .command-line {
        color:#b9ffef;
      }

      .padik-terminal .prompt {
        color:#38d5ff;
        margin-right:8px;
        white-space:nowrap;
      }

      .padik-terminal .success {
        color:#00ffd1;
        font-weight:bold;
      }

      .padik-terminal .error {
        color:#ff6b6b;
      }

      .padik-terminal .warning {
        color:#ffbd2e;
      }

      .padik-terminal .muted {
        color:#7f8fa6;
      }

      .padik-terminal .path {
        color:#c792ea;
      }

      .padik-terminal .terminal-input-line {
        display:flex;
        align-items:center;
        gap:0;
        margin-top:6px;
      }

      .padik-terminal .terminal-input {
        flex:1;
        background:transparent;
        border:none;
        outline:none;
        color:#b9ffef;
        font:inherit;
        min-width:80px;
        caret-color:#00ffd1;
      }

      .padik-terminal .terminal-body::-webkit-scrollbar {
        width:10px;
      }

      .padik-terminal .terminal-body::-webkit-scrollbar-track {
        background:rgba(255,255,255,0.04);
      }

      .padik-terminal .terminal-body::-webkit-scrollbar-thumb {
        background:rgba(56,213,255,0.35);
        border-radius:999px;
      }

      @media (max-width:600px) {
        .padik-terminal .terminal-body {
          font-size:13px;
          padding:18px;
          min-height:360px;
        }

        .padik-terminal .terminal-title {
          font-size:12px;
        }

        .padik-terminal .prompt {
          white-space:normal;
        }
      }
    `;

    document.head.appendChild(style);
  }

  const body = terminal.querySelector(".terminal-body");
  const output = terminal.querySelector(".terminal-output");
  const input = terminal.querySelector(".terminal-input");
  const promptElement = terminal.querySelector(".terminal-prompt");

  let currentPath = "/home/padik";
  let history = [];
  let historyIndex = -1;
  let redirectInProgress = false;

  /*
   * Falešný souborový systém.
   * Existuje pouze v paměti návštěvníkova prohlížeče.
   */
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

                  content:
`<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>padik.eu</title>
</head>
<body>
  <h1>Padik.eu</h1>
</body>
</html>`
                },

                "style.css": {
                  type: "file",

                  content:
`body {
  background:#050816;
  color:#ffffff;
  font-family:Arial, sans-serif;
}

h1 {
  color:#00ffd1;
}`
                },

                "config.php": {
                  type: "file",

                  content:
`<?php

// Fake configuration file.

define("DB_NAME", "padik_web");
define("DB_USER", "padik");
define("DB_HOST", "localhost");`
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
89.203.248.130 - GET /data/web/index.html HTTP/2 403
46.36.36.74 - GET /login HTTP/2 200
127.0.0.1 - GET /server-status HTTP/1.1 200`
                },

                "error.log": {
                  type: "file",

                  content:
`[error] permission denied: /data/web/index.html
[warning] suspicious terminal access detected
[notice] nginx reload complete
[error] file too large: index.html`
                },

                "auth.log": {
                  type: "file",

                  content:
`Jun 04 12:01:33 padik sshd[1365]: Accepted password for ${terminalUser}
Jun 04 12:02:10 padik sudo: ${terminalUser} : TTY=pts/0 ; COMMAND=/bin/cat readme.txt
Jun 04 12:04:44 padik systemd-logind: New session opened`
                },

                "nginx.log": {
                  type: "file",

                  content:
`nginx started
proxy_pass https://backend
TLS certificate valid
padik.eu online`
                },

                "crash.log": {
                  type: "file",

                  content:
`last crash: none
critical file: /data/web/index.html
status: stable`
                },

                "database.log": {
                  type: "file",

                  content:
`database connection established
database: padik_web
server: localhost
status: connected`
                },

                "system.log": {
                  type: "file",

                  content:
`kernel: fake-console initialized
filesystem: mounted
network: connected
web service: active`
                }
              }
            },

            "backup": {
              type: "dir",

              children: {
                "old-readme.txt": {
                  type: "file",

                  content:
`Starý README soubor.
Nic zajímavého tady není... možná.`
                },

                "secret-note.txt": {
                  type: "file",

                  content:
`Tajná poznámka:
Nikdy nevěř konzoli, která se tváří až příliš opravdově.`
                },

                "web-backup.tar.gz": {
                  type: "file",
                  tooLarge: true,

                  content:
`Fake compressed backup file.`
                }
              }
            }
          }
        }
      }
    }
  };

  function addLine(text = "", className = "line") {
    const line = document.createElement("div");

    line.className = className;
    line.innerHTML = text;

    output.appendChild(line);
    scrollBottom();
  }

  function addRawLine(text = "", className = "line") {
    addLine(escapeHtml(text), className);
  }

  function scrollBottom() {
    body.scrollTop = body.scrollHeight;
  }

  function displayPath(path) {
    if (path === "/home/padik") {
      return "~";
    }

    if (path.startsWith("/home/padik/")) {
      return "~" + path.substring("/home/padik".length);
    }

    return path;
  }

  function updatePrompt() {
    const path = displayPath(currentPath);

    promptElement.textContent =
      terminalUser + "@" + terminalServer + ":" + path + "#";
  }

  function normalizePath(path) {
    let requestedPath = String(path || "").trim();

    if (!requestedPath) {
      return currentPath;
    }

    if (requestedPath === "~") {
      return "/home/padik";
    }

    if (requestedPath.startsWith("~/")) {
      requestedPath =
        "/home/padik/" +
        requestedPath.substring(2);
    }

    if (requestedPath === "/data") {
      requestedPath = "/home/padik/data";
    } else if (requestedPath.startsWith("/data/")) {
      requestedPath =
        "/home/padik" +
        requestedPath;
    } else if (!requestedPath.startsWith("/")) {
      requestedPath =
        currentPath +
        "/" +
        requestedPath;
    }

    const parts = [];

    requestedPath.split("/").forEach(function (part) {
      if (!part || part === ".") {
        return;
      }

      if (part === "..") {
        if (parts.length > 0) {
          parts.pop();
        }

        return;
      }

      parts.push(part);
    });

    return "/" + parts.join("/");
  }

  function getNode(path) {
    const rootPath = "/home/padik";

    if (path === rootPath) {
      return fs[rootPath];
    }

    if (!path.startsWith(rootPath + "/")) {
      return null;
    }

    const relativeParts = path
      .substring(rootPath.length)
      .split("/")
      .filter(Boolean);

    let node = fs[rootPath];

    for (const part of relativeParts) {
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
    const parts = path
      .split("/")
      .filter(Boolean);

    const name = parts.pop();
    const parentPath = "/" + parts.join("/");

    return {
      parent: getNode(parentPath),
      name: name
    };
  }

  function listDirectory(path) {
    const node = getNode(path);

    if (!node) {
      addLine(
        "ls: cannot access '" +
        escapeHtml(displayPath(path)) +
        "': No such file or directory",
        "line error"
      );

      return;
    }

    if (node.type !== "dir") {
      addRawLine(displayPath(path));
      return;
    }

    const names = Object.keys(node.children || {});

    if (names.length === 0) {
      return;
    }

    const rendered = names
      .map(function (name) {
        const item = node.children[name];

        if (item.type === "dir") {
          return (
            "<span class='path'>" +
            escapeHtml(name) +
            "/</span>"
          );
        }

        return escapeHtml(name);
      })
      .join("   ");

    addLine(rendered);
  }

  function printHelp() {
    addRawLine("GNU bash, version 5.2.15(1)-release");
    addRawLine("These shell commands are defined internally.");
    addRawLine("");
    addRawLine("Built-in commands:");
    addRawLine("  cd        clear     echo      help");
    addRawLine("  pwd       ls        cat       rm");
    addRawLine("  mkdir     touch     date      whoami");
    addRawLine("  curl      dig       systemctl");
  }

  function hasRecursiveFlag(args) {
    return args.some(function (arg) {
      return (
        arg.startsWith("-") &&
        arg.includes("r")
      );
    });
  }

  function simulateWebsiteCrash() {
    if (redirectInProgress) {
      return;
    }

    redirectInProgress = true;
    input.disabled = true;

    addLine(
      '<span class="error">CRITICAL:</span> required website files were deleted'
    );

    addLine(
      '<span class="warning">nginx: document root is unavailable</span>'
    );

    addLine(
      '<span class="warning">padik.eu stopped responding...</span>'
    );

    addLine(
      '<span class="error">HTTP/1.1 500 Internal Server Error</span>'
    );

    addLine(
      '<span class="success">redirecting to fallback page...</span>'
    );

    setTimeout(function () {
      window.location.assign("https://padik.eu.xd/");
    }, 1800);
  }

  function normalizeStartupUrl(value) {
    let urlAddress = String(value || "/").trim();

    if (!urlAddress) {
      return "/";
    }

    try {
      const parsedUrl = new URL(
        urlAddress,
        "https://padik.eu"
      );

      return (
        parsedUrl.pathname +
        parsedUrl.search +
        parsedUrl.hash
      );
    } catch (error) {
      if (!urlAddress.startsWith("/")) {
        urlAddress = "/" + urlAddress;
      }

      return urlAddress;
    }
  }

  function startupSimulation() {
    const startupMode =
      terminal.dataset.startup ||
      "";

    const urlAddress =
      normalizeStartupUrl(
        terminal.dataset.url ||
        "/"
      );

    const promptText =
      escapeHtml(terminalUser) +
      "@" +
      escapeHtml(terminalServer) +
      ":~#";

    if (startupMode === "website_connection") {
      addLine(
        '<span class="prompt">' +
        promptText +
        "</span> curl -I https://padik.eu"
      );

      addRawLine("HTTP request initialized...");

      addLine(
        '<span class="prompt">resolver@dns:~#</span> dig padik.eu A'
      );

      addLine(
        'status: <span class="success">NOERROR</span>'
      );

      addRawLine(
        "answer: padik.eu → server IP"
      );

      addLine(
        '<span class="prompt">proxy@nginx:~#</span> proxy_pass https://backend'
      );

      addRawLine(
        "upstream: wordpress:443"
      );

      addLine(
        'tls: <span class="success">valid</span>'
      );

      addLine(
        '<span class="prompt">app@wordpress:~#</span> systemctl status apache2'
      );

      addLine(
        'service: <span class="success">active running</span>'
      );

      addLine(
        '<span class="success">✔ padik.eu is online</span>'
      );

      addRawLine("");
      return;
    }

    if (startupMode === "error_404") {
      const escapedUrl =
        escapeHtml(urlAddress);

      addLine(
        '<span class="prompt">' +
        promptText +
        "</span> GET " +
        escapedUrl
      );

      addRawLine(
        "request: https://padik.eu" +
        urlAddress
      );

      addLine(
        '<span class="prompt">nginx@proxy:~#</span> checking /data/web' +
        escapedUrl
      );

      addLine(
        '<span class="error">404 Not Found</span>'
      );

      addRawLine(
        "soubor nebyl nalezen v /data/web/"
      );

      addRawLine(
        "hledaný soubor: /data/web" +
        urlAddress
      );

      addLine(
        '<span class="warning">nginx: file not found</span>'
      );

      addLine(
        '<span class="error">HTTP/1.1 404 Not Found</span>'
      );

      addRawLine("");
    }
  }

  function runCommand(command) {
    const trimmed = command.trim();

    if (!trimmed) {
      return;
    }

    const args = trimmed.split(/\s+/);
    const commandName = args[0].toLowerCase();
    const rest = args.slice(1);

    if (commandName === "help") {
      printHelp();
      return;
    }

    if (commandName === "clear") {
      output.innerHTML = "";
      return;
    }

    if (commandName === "pwd") {
      addRawLine(displayPath(currentPath));
      return;
    }

    if (commandName === "ls") {
      const pathArgument =
        rest.find(function (arg) {
          return !arg.startsWith("-");
        });

      const target = pathArgument
        ? normalizePath(pathArgument)
        : currentPath;

      listDirectory(target);
      return;
    }

    if (commandName === "cd") {
      const target = rest[0]
        ? normalizePath(rest[0])
        : "/home/padik";

      const node = getNode(target);

      if (!node) {
        addLine(
          "bash: cd: " +
          escapeHtml(rest[0] || "") +
          ": No such file or directory",
          "line error"
        );

        return;
      }

      if (node.type !== "dir") {
        addLine(
          "bash: cd: " +
          escapeHtml(rest[0]) +
          ": Not a directory",
          "line error"
        );

        return;
      }

      currentPath = target;
      updatePrompt();
      return;
    }

    if (commandName === "cat") {
      if (!rest[0]) {
        addLine(
          "cat: missing operand",
          "line error"
        );

        return;
      }

      const target =
        normalizePath(rest[0]);

      const node =
        getNode(target);

      if (!node) {
        addLine(
          "cat: " +
          escapeHtml(rest[0]) +
          ": No such file or directory",
          "line error"
        );

        return;
      }

      if (node.type !== "file") {
        addLine(
          "cat: " +
          escapeHtml(rest[0]) +
          ": Is a directory",
          "line error"
        );

        return;
      }

      if (node.tooLarge) {
        addLine(
          "cat: " +
          escapeHtml(rest[0]) +
          ": file is too large",
          "line error"
        );

        return;
      }

      addRawLine(node.content || "");
      return;
    }

    if (commandName === "touch") {
      if (!rest[0]) {
        addLine(
          "touch: missing file operand",
          "line error"
        );

        return;
      }

      const target =
        normalizePath(rest[0]);

      const data =
        getParentAndName(target);

      if (
        !data.parent ||
        data.parent.type !== "dir"
      ) {
        addLine(
          "touch: cannot touch '" +
          escapeHtml(rest[0]) +
          "': No such file or directory",
          "line error"
        );

        return;
      }

      if (!data.name) {
        addLine(
          "touch: invalid file name",
          "line error"
        );

        return;
      }

      if (!data.parent.children[data.name]) {
        data.parent.children[data.name] = {
          type: "file",
          content: ""
        };
      }

      return;
    }

    if (commandName === "mkdir") {
      if (!rest[0]) {
        addLine(
          "mkdir: missing operand",
          "line error"
        );

        return;
      }

      const target =
        normalizePath(rest[0]);

      const data =
        getParentAndName(target);

      if (
        !data.parent ||
        data.parent.type !== "dir"
      ) {
        addLine(
          "mkdir: cannot create directory '" +
          escapeHtml(rest[0]) +
          "': No such file or directory",
          "line error"
        );

        return;
      }

      if (data.parent.children[data.name]) {
        addLine(
          "mkdir: cannot create directory '" +
          escapeHtml(rest[0]) +
          "': File exists",
          "line error"
        );

        return;
      }

      data.parent.children[data.name] = {
        type: "dir",
        children: {}
      };

      return;
    }

    if (commandName === "rm") {
      if (rest.length === 0) {
        addLine(
          "rm: missing operand",
          "line error"
        );

        return;
      }

      const targetArgument =
        rest.find(function (arg) {
          return !arg.startsWith("-");
        });

      if (!targetArgument) {
        addLine(
          "rm: missing operand",
          "line error"
        );

        return;
      }

      const target =
        normalizePath(targetArgument);

      const data =
        getParentAndName(target);

      if (
        !data.parent ||
        !data.parent.children ||
        !Object.prototype.hasOwnProperty.call(
          data.parent.children,
          data.name
        )
      ) {
        addLine(
          "rm: cannot remove '" +
          escapeHtml(targetArgument) +
          "': No such file or directory",
          "line error"
        );

        return;
      }

      const node =
        data.parent.children[data.name];

      const recursive =
        hasRecursiveFlag(rest);

      if (
        node.type === "dir" &&
        Object.keys(node.children || {}).length > 0 &&
        !recursive
      ) {
        addLine(
          "rm: cannot remove '" +
          escapeHtml(targetArgument) +
          "': Is a directory",
          "line error"
        );

        return;
      }

      const isCriticalWebsiteDeletion =
        target === "/home/padik/data" ||
        target === "/home/padik/data/web" ||
        target === "/home/padik/data/web/index.html";

      delete data.parent.children[data.name];

      if (
        currentPath === target ||
        currentPath.startsWith(target + "/")
      ) {
        currentPath = "/home/padik";
        updatePrompt();
      }

      if (isCriticalWebsiteDeletion) {
        simulateWebsiteCrash();
      }

      return;
    }

    if (commandName === "echo") {
      addRawLine(rest.join(" "));
      return;
    }

    if (commandName === "date") {
      addRawLine(
        new Date().toLocaleString("cs-CZ")
      );

      return;
    }

    if (commandName === "whoami") {
      addRawLine(terminalUser);
      return;
    }

    if (commandName === "curl") {
      const fullCommand =
        rest.join(" ");

      if (
        fullCommand.includes("padik.eu")
      ) {
        const webNode =
          getNode(
            "/home/padik/data/web/index.html"
          );

        if (!webNode) {
          addLine(
            '<span class="error">HTTP/1.1 500 Internal Server Error</span>'
          );

          addRawLine(
            "server: nginx"
          );

          addRawLine(
            "upstream: failed"
          );

          return;
        }

        addRawLine(
          "HTTP/2 200"
        );

        addRawLine(
          "server: nginx"
        );

        addRawLine(
          "content-type: text/html; charset=UTF-8"
        );

        addRawLine(
          "x-powered-by: WordPress"
        );

        addLine(
          '<span class="success">✔ padik.eu is online</span>'
        );
      } else {
        addLine(
          "curl: could not resolve host",
          "line error"
        );
      }

      return;
    }

    if (commandName === "dig") {
      const fullCommand =
        rest.join(" ");

      if (
        fullCommand.includes("padik.eu")
      ) {
        addRawLine(
          "; <<>> DiG 9.18 <<>> padik.eu A"
        );

        addLine(
          'status: <span class="success">NOERROR</span>'
        );

        addRawLine(
          "answer: padik.eu → server IP"
        );
      } else {
        addLine(
          "status: NXDOMAIN",
          "line error"
        );
      }

      return;
    }

    if (commandName === "systemctl") {
      const fullCommand =
        rest.join(" ");

      if (
        fullCommand.includes("apache2")
      ) {
        addRawLine(
          "● apache2.service - The Apache HTTP Server"
        );

        addLine(
          'Active: <span class="success">active (running)</span>'
        );

        addRawLine(
          "Main PID: 1365 (apache2)"
        );

        return;
      }

      if (
        fullCommand.includes("nginx")
      ) {
        addRawLine(
          "● nginx.service - A high performance web server"
        );

        addLine(
          'Active: <span class="success">active (running)</span>'
        );

        addRawLine(
          "Main PID: 443 (nginx)"
        );

        return;
      }

      addLine(
        "Unit not found.",
        "line error"
      );

      return;
    }

    addLine(
      escapeHtml(commandName) +
      ": command not found",
      "line error"
    );
  }

  input.addEventListener(
    "keydown",
    function (event) {
      if (redirectInProgress) {
        event.preventDefault();
        return;
      }

      if (event.key === "Enter") {
        const command =
          input.value;

        input.value = "";

        if (command.trim()) {
          history.push(command);
          historyIndex = history.length;
        }

        addLine(
          '<span class="prompt">' +
          escapeHtml(promptElement.textContent) +
          "</span> " +
          escapeHtml(command),
          "line command-line"
        );

        runCommand(command);
        scrollBottom();
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();

        if (history.length === 0) {
          return;
        }

        historyIndex =
          Math.max(
            0,
            historyIndex - 1
          );

        input.value =
          history[historyIndex] || "";

        requestAnimationFrame(function () {
          input.setSelectionRange(
            input.value.length,
            input.value.length
          );
        });

        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();

        if (history.length === 0) {
          return;
        }

        historyIndex =
          Math.min(
            history.length,
            historyIndex + 1
          );

        input.value =
          history[historyIndex] || "";

        requestAnimationFrame(function () {
          input.setSelectionRange(
            input.value.length,
            input.value.length
          );
        });

        return;
      }

      if (event.key === "Tab") {
        event.preventDefault();
      }
    }
  );

  terminal.addEventListener(
    "click",
    function () {
      if (!redirectInProgress) {
        input.focus();
      }
    }
  );

  updatePrompt();
  startupSimulation();
  input.focus();
})();
