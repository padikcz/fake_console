# Fake Console

Struktura:

```text
fake_console/
├── terminal.js
├── filesystem/
│   └── default.json
└── commands/
    ├── help.js
    ├── clear.js
    ├── pwd.js
    ├── ls.js
    ├── cd.js
    ├── cat.js
    ├── touch.js
    ├── mkdir.js
    ├── rm.js
    ├── echo.js
    ├── date.js
    ├── whoami.js
    ├── curl.js
    ├── dig.js
    └── systemctl.js
```

Použití:

```html
<div
  id="console"
  user="host"
  server="padikcom"
  notcommand=""
></div>

<script>
  const script = document.createElement("script");
  script.src =
    "https://cdn.jsdelivr.net/gh/padikcz/fake_console@main/terminal.js?v=" +
    Date.now();
  document.body.appendChild(script);
</script>
```

Zakázání příkazu:

```html
<div id="console" notcommand="cd"></div>
```

Více příkazů:

```html
<div id="console" notcommand="cd, rm, mkdir"></div>
```
