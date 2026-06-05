(function () {
  "use strict";

  window.PadikTerminalFileSystem = function (options = {}) {
    const terminalUser = options.terminalUser || "host";
    const terminalServer = options.terminalServer || "padikcom";

    return {
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
  };;
  };
})();
