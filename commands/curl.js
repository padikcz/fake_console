window.PadikTerminalCommands.curl = function (command, ctx) {
  const args = command.trim().split(/\s+/).slice(1);
  const full = args.join(" ");

  if (!full.includes("padik.eu")) {
    ctx.addLine("curl: could not resolve host", "line error");
    return;
  }

  const webNode = ctx.getNode("/home/padik/data/web/index.html");

  if (!webNode) {
    ctx.addLine(
      '<span class="error">HTTP/1.1 500 Internal Server Error</span>'
    );
    ctx.addRawLine("server: nginx");
    ctx.addRawLine("upstream: failed");
    return;
  }

  ctx.addRawLine("HTTP/2 200");
  ctx.addRawLine("server: nginx");
  ctx.addRawLine("content-type: text/html; charset=UTF-8");
  ctx.addLine('<span class="success">✔ padik.eu is online</span>');
};
