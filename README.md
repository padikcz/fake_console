# Fake Console

Struktura:

```text
fake_console/
├── terminal.js
├── filesystem/
│   └── default.json
└── commands/
    ├── help.js
    └── ...
```

`terminal.js` načítá falešný souborový systém z:

```text
filesystem/default.json
```

Použití:

```html
<div
  id="console"
  user="host"
  server="padikcom"
></div>

<script>
  const script = document.createElement("script");

  script.src =
    "https://cdn.jsdelivr.net/gh/padikcz/fake_console@main/terminal.js?v=" +
    Date.now();

  document.body.appendChild(script);
</script>
```
