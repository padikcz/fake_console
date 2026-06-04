(function(){
  const terminal = document.getElementById("padik-terminal");

  if(!terminal){
    console.error("Padik terminal: element #padik-terminal nebyl nalezen.");
    return;
  }

  terminal.classList.add("padik-terminal");

  terminal.innerHTML = `
    <div class="terminal-top">
      <div class="dot red"></div>
      <div class="dot yellow"></div>
      <div class="dot green"></div>
      <div class="terminal-title">host@padikcom: connected</div>
    </div>

    <div class="terminal-body" id="terminal-body">
      <div class="terminal-output" id="terminal-output"></div>

      <div class="terminal-input-line" id="terminal-input-line">
        <span class="prompt" id="terminal-prompt">host@padikcom:~#</span>
        <input
          id="terminal-input"
          class="terminal-input"
          type="text"
          autocomplete="off"
          spellcheck="false"
          autofocus
        />
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .padik-terminal{
      background:#050816;
      border-radius:20px;
      overflow:hidden;
      border:1px solid rgba(255,255,255,0.12);
      box-shadow:0 25px 80px rgba(0,0,0,.45);
      max-width:100%;
    }

    .padik-terminal .terminal-top{
      padding:12px 16px;
      background:rgba(255,255,255,0.07);
      display:flex;
      align-items:center;
      gap:8px;
    }

    .padik-terminal .terminal-title{
      margin-left:10px;
      font-family:Consolas, "Courier New", monospace;
      font-size:13px;
      color:#8aa0b8;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }

    .padik-terminal .dot{
      width:12px;
      height:12px;
      border-radius:50%;
      flex:0 0 auto;
    }

    .padik-terminal .red{background:#ff5f56;}
    .padik-terminal .yellow{background:#ffbd2e;}
    .padik-terminal .green{background:#27c93f;}

    .padik-terminal .terminal-body{
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

    .padik-terminal .terminal-output{
      white-space:pre-wrap;
      word-break:break-word;
    }

    .padik-terminal .line{
      margin:0 0 6px;
    }

    .padik-terminal .command-line{
      color:#b9ffef;
    }

    .padik-terminal .prompt{
      color:#38d5ff;
      margin-right:8px;
      white-space:nowrap;
    }

    .padik-terminal .success{
      color:#00ffd1;
      font-weight:bold;
    }

    .padik-terminal .error{
      color:#ff6b6b;
    }

    .padik-terminal .warning{
      color:#ffbd2e;
    }

    .padik-terminal .muted{
      color:#7f8fa6;
    }

    .padik-terminal .path{
      color:#c792ea;
    }

    .padik-terminal .terminal-input-line{
      display:flex;
      align-items:center;
      gap:0;
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

    .padik-terminal .terminal-body::-webkit-scrollbar{
      width:10px;
    }

    .padik-terminal .terminal-body::-webkit-scrollbar-track{
      background:rgba(255,255,255,0.04);
    }

    .padik-terminal .terminal-body::-webkit-scrollbar-thumb{
      background:rgba(56,213,255,0.35);
      border-radius:999px;
    }

    @media(max-width:600px){
      .padik-terminal .terminal-body{
        font-size:13px;
        padding:18px;
        min-height:360px;
      }

      .padik-terminal .terminal-title{
        font-size:12px;
      }

      .padik-terminal .prompt{
        white-space:normal;
      }
    }
  `;
  document.head.appendChild(style);

  const body = document.getElementById("terminal-body");
  const output = document.getElementById("terminal-output");
  const input = document.getElementById("terminal-input");
  const promptEl = document.getElementById("terminal-prompt");

  let currentPath = "/home/padik";
  let history = [];
  let historyIndex = -1;

  const fs = {
    "/home/padik": {
      type: "dir",
      children: {
        "readme.txt": {
          type: "file",
          content:
`Ahoj já jsem Padik a ty jsi v mé konzoli.
Jak jsi se sem dostal ??

Hlavně neotvírej soubor:
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
<html>
<head>
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
  background: #050816;
  color: #ffffff;
  font-family: Arial, sans-serif;
}

h1 {
  color: #00ffd1;
}`
                },

                "config.php": {
                  type: "file",
                  content:
`<?php
define("DB_NAME", "padik_web");
define("DB_USER", "padik");
define("DB_HOST", "localhost");
?>`
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
`Jun 04 12:01:33 padik sshd[1365]: Accepted password for host
Jun 04 12:02:10 padik sudo: host : TTY=pts/0 ; COMMAND=/bin/cat readme.txt
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
protected file: /data/web/index.html
status: stable`
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
Nikdy nevěř konzoli, která se tváří moc opravdově.`
                }
              }
            }
          }
        }
      }
    }
  };

  function escapeHtml(text){
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function addLine(text = "", className = "line"){
    const div = document.createElement("div");
    div.className = className;
    div.innerHTML = text;
    output.appendChild(div);
    scrollBottom();
  }

  function addRawLine(text = "", className = "line"){
    addLine(escapeHtml(text), className);
  }

  function scrollBottom(){
    body.scrollTop = body.scrollHeight;
  }

 function updatePrompt(){
  let path = displayPath(currentPath);

  if(path.startsWith("/data")){
    path = "~" + path;
  }

  promptEl.textContent = "host@padikcom:" + path + "#";
}
  function normalizePath(path){
    const parts = [];

    if(path.startsWith("/data")){
      path = "/home/padik" + path;
    } else if(!path.startsWith("/")){
      path = currentPath + "/" + path;
    }

    path.split("/").forEach(part => {
      if(!part || part === ".") return;
      if(part === "..") parts.pop();
      else parts.push(part);
    });

    return "/" + parts.join("/");
  }

  function displayPath(path){
    if(path.startsWith("/home/padik/data")){
      return path.replace("/home/padik", "");
    }

    if(path === "/home/padik"){
      return "~";
    }

    return path.replace("/home/padik", "~");
  }

  function getNode(path){
    if(path === "/home/padik") return fs["/home/padik"];

    const rootPath = "/home/padik";

    if(!path.startsWith(rootPath)) return null;

    const rel = path.replace(rootPath, "").split("/").filter(Boolean);
    let node = fs[rootPath];

    for(const part of rel){
      if(!node || node.type !== "dir" || !node.children[part]) return null;
      node = node.children[part];
    }

    return node;
  }

  function getParentAndName(path){
    const parts = path.split("/").filter(Boolean);
    const name = parts.pop();
    const parentPath = "/" + parts.join("/");

    return {
      parent: getNode(parentPath),
      name
    };
  }

  function listDir(path){
    const node = getNode(path);

    if(!node){
      addLine("ls: složka neexistuje", "line error");
      return;
    }

    if(node.type !== "dir"){
      addRawLine(displayPath(path));
      return;
    }

    const names = Object.keys(node.children);

    if(names.length === 0){
      addLine("<span class='muted'>prázdná složka</span>");
      return;
    }

    const rendered = names.map(name => {
      const item = node.children[name];

      if(item.type === "dir"){
        return "<span class='path'>" + escapeHtml(name) + "/</span>";
      }

      return escapeHtml(name);
    }).join("   ");

    addLine(rendered);
  }

  function printHelp(){
    addRawLine(`bash: help`);
    addRawLine(``);
    addRawLine(`Built-in commands:`);
    addRawLine(`  cd        clear     echo      help`);
    addRawLine(`  pwd       ls        cat       rm`);
    addRawLine(`  mkdir     touch     date      whoami`);
    addRawLine(`  curl      dig       systemctl`);
  }

  function isRecursiveRemove(args){
    return args.some(arg => {
      return arg === "-r" ||
             arg === "-f" ||
             arg === "-rf" ||
             arg === "-fr" ||
             (arg.includes("r") && arg.startsWith("-"));
    });
  }

  function simulateWebsiteCrash(){
    addLine(`<span class="error">KRITICKÁ CHYBA:</span> byl smazán důležitý soubor webu`);
    addLine(`<span class="warning">web padik.eu přestal odpovídat...</span>`);
    addLine(`<span class="warning">nginx: upstream failed</span>`);
    addLine(`<span class="error">HTTP/1.1 500 Internal Server Error</span>`);
    addLine(`<span class="success">přesměrovávám na záložní stránku...</span>`);

    setTimeout(function(){
      window.location.href = "https://padik.eu.xd/";
    }, 1800);
  }

  function startupSimulation(){
    const startupMode = terminal.dataset.startup || "";
    const urlAddress = terminal.dataset.url || "/";

    if(startupMode === "website_connection"){
      addLine(`<span class="prompt">host@padikcom:~#</span> curl -I https://padik.eu`);
      addRawLine(`HTTP request initialized...`);
      addLine(`<span class="prompt">resolver@dns:~#</span> dig padik.eu A`);
      addLine(`status: <span class="success">NOERROR</span>`);
      addRawLine(`answer: padik.eu → server IP`);
      addLine(`<span class="prompt">proxy@nginx:~#</span> proxy_pass https://backend`);
      addRawLine(`upstream: wordpress:443`);
      addLine(`tls: <span class="success">valid</span>`);
      addLine(`<span class="prompt">app@wordpress:~#</span> systemctl status apache2`);
      addLine(`service: <span class="success">active running</span>`);
      addLine(`<span class="success">✔ padik.eu is online</span>`);
      addRawLine(``);
    }

    if(startupMode === "error_404"){
      addLine(`<span class="prompt">host@padikcom:~#</span> GET ${escapeHtml(urlAddress)}`);
      addRawLine(`request: https://padik.eu${urlAddress}`);
      addLine(`<span class="prompt">nginx@proxy:~#</span> checking /data/web${escapeHtml(urlAddress)}`);
      addLine(`<span class="error">404 Not Found</span>`);
      addRawLine(`soubor nebyl nalezen v /data/web/`);
      addRawLine(`hledaný soubor: /data/web${urlAddress}`);
      addLine(`<span class="warning">nginx: file not found</span>`);
      addLine(`<span class="error">HTTP/1.1 404 Not Found</span>`);
      addRawLine(``);
    }
  }

  function runCommand(command){
    const trimmed = command.trim();

    if(!trimmed) return;

    const args = trimmed.split(/\s+/);
    const cmd = args[0];
    const rest = args.slice(1);

    if(cmd === "help"){
      printHelp();
      return;
    }

    if(cmd === "clear"){
      output.innerHTML = "";
      return;
    }

    if(cmd === "pwd"){
      addRawLine(displayPath(currentPath));
      return;
    }

    if(cmd === "ls"){
      const target = rest[0] ? normalizePath(rest[0]) : currentPath;
      listDir(target);
      return;
    }

    if(cmd === "cd"){
      const target = rest[0] ? normalizePath(rest[0]) : "/home/padik";
      const node = getNode(target);

      if(!node){
        addLine("cd: složka neexistuje", "line error");
        return;
      }

      if(node.type !== "dir"){
        addLine("cd: není složka", "line error");
        return;
      }

      currentPath = target;
      updatePrompt();
      return;
    }

    if(cmd === "cat"){
      if(!rest[0]){
        addLine("cat: zadej název souboru", "line error");
        return;
      }

      const target = normalizePath(rest[0]);
      const node = getNode(target);

      if(!node){
        addLine("cat: soubor neexistuje", "line error");
        return;
      }

      if(node.type !== "file"){
        addLine("cat: toto je složka", "line error");
        return;
      }

      if(node.tooLarge){
        addLine("cat: soubor je příliš velký", "line error");
        return;
      }

      addRawLine(node.content || "");
      return;
    }

    if(cmd === "touch"){
      if(!rest[0]){
        addLine("touch: zadej název souboru", "line error");
        return;
      }

      const target = normalizePath(rest[0]);
      const data = getParentAndName(target);

      if(!data.parent || data.parent.type !== "dir"){
        addLine("touch: cesta neexistuje", "line error");
        return;
      }

      if(!data.parent.children[data.name]){
        data.parent.children[data.name] = {
          type: "file",
          content: ""
        };
      }

      addLine(`<span class="success">vytvořeno:</span> ${escapeHtml(data.name)}`);
      return;
    }

    if(cmd === "mkdir"){
      if(!rest[0]){
        addLine("mkdir: zadej název složky", "line error");
        return;
      }

      const target = normalizePath(rest[0]);
      const data = getParentAndName(target);

      if(!data.parent || data.parent.type !== "dir"){
        addLine("mkdir: cesta neexistuje", "line error");
        return;
      }

      if(data.parent.children[data.name]){
        addLine("mkdir: už existuje", "line error");
        return;
      }

      data.parent.children[data.name] = {
        type: "dir",
        children: {}
      };

      addLine(`<span class="success">složka vytvořena:</span> ${escapeHtml(data.name)}`);
      return;
    }

    if(cmd === "rm"){
      if(rest.length === 0){
        addLine("rm: zadej soubor nebo složku", "line error");
        return;
      }

      const targetArg = rest.find(arg => !arg.startsWith("-"));

      if(!targetArg){
        addLine("rm: zadej soubor nebo složku", "line error");
        return;
      }

      const target = normalizePath(targetArg);
      const data = getParentAndName(target);

      if(!data.parent || !data.parent.children[data.name]){
        addLine("rm: soubor neexistuje", "line error");
        return;
      }

      const node = data.parent.children[data.name];

      const isCriticalWebDelete =
        target === "/home/padik/data" ||
        target === "/home/padik/data/web" ||
        target === "/home/padik/data/web/index.html";

      const recursive = isRecursiveRemove(rest);

      if(node.type === "dir" && Object.keys(node.children).length > 0 && !recursive){
        addLine("rm: složka není prázdná. Použij rm -rf " + escapeHtml(targetArg), "line error");
        return;
      }

      delete data.parent.children[data.name];

      addLine(`<span class="success">smazáno:</span> ${escapeHtml(targetArg)}`);

      if(isCriticalWebDelete){
        simulateWebsiteCrash();
      }

      return;
    }

    if(cmd === "echo"){
      addRawLine(rest.join(" "));
      return;
    }

    if(cmd === "date"){
      addRawLine(new Date().toLocaleString("cs-CZ"));
      return;
    }

    if(cmd === "whoami"){
      addRawLine("host");
      return;
    }

    if(cmd === "curl"){
      const full = rest.join(" ");

      if(full.includes("padik.eu")){
        const webNode = getNode("/home/padik/data/web/index.html");

        if(!webNode){
          addLine(`<span class="error">HTTP/1.1 500 Internal Server Error</span>`);
          addRawLine("server: nginx");
          addRawLine("upstream: failed");
          return;
        }

        addRawLine("HTTP/2 200");
        addRawLine("server: nginx");
        addRawLine("content-type: text/html; charset=UTF-8");
        addRawLine("x-powered-by: WordPress");
        addLine(`<span class="success">✔ padik.eu is online</span>`);
      } else {
        addLine("curl: simulace podporuje hlavně https://padik.eu", "line warning");
      }

      return;
    }

    if(cmd === "dig"){
      const full = rest.join(" ");

      if(full.includes("padik.eu")){
        addRawLine("; <<>> DiG <<>> padik.eu A");
        addLine(`status: <span class="success">NOERROR</span>`);
        addRawLine("answer: padik.eu → server IP");
      } else {
        addLine("dig: doména nenalezena v demo DNS", "line error");
      }

      return;
    }

    if(cmd === "systemctl"){
      const full = rest.join(" ");

      if(full.includes("apache2")){
        addRawLine("● apache2.service - The Apache HTTP Server");
        addLine(`Active: <span class="success">active running</span>`);
        addRawLine("Main PID: 1365 (apache2)");
      } else if(full.includes("nginx")){
        addRawLine("● nginx.service - A high performance web server");
        addLine(`Active: <span class="success">active running</span>`);
        addRawLine("Main PID: 443 (nginx)");
      } else {
        addLine("systemctl: neznámá služba", "line warning");
      }

      return;
    }

    addLine(`${escapeHtml(cmd)}: command not found`, "line error");
  }

  input.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
      const command = input.value;
      input.value = "";

      if(command.trim()){
        history.push(command);
        historyIndex = history.length;
      }

      addLine(`<span class="prompt">${escapeHtml(promptEl.textContent)}</span> ${escapeHtml(command)}`, "line command-line");

      runCommand(command);
      scrollBottom();
    }

    if(e.key === "ArrowUp"){
      e.preventDefault();

      if(history.length === 0) return;

      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex] || "";
      setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
    }

    if(e.key === "ArrowDown"){
      e.preventDefault();

      if(history.length === 0) return;

      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] || "";
      setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
    }

    if(e.key === "Tab"){
      e.preventDefault();
    }
  });

  terminal.addEventListener("click", function(){
    input.focus();
  });

  updatePrompt();
  startupSimulation();
})();