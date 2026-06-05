window.PadikTerminalCommands.systemctl = function (command, ctx) {
  const args = command.trim().split(/\s+/).slice(1);
  const full = args.join(" ");

  if (full.includes("apache2")) {
    ctx.addRawLine("● apache2.service - The Apache HTTP Server");
    ctx.addLine(
      'Active: <span class="success">active (running)</span>'
    );
    ctx.addRawLine("Main PID: 1365 (apache2)");
    return;
  }

  if (full.includes("nginx")) {
    ctx.addRawLine("● nginx.service - A high performance web server");
    ctx.addLine(
      'Active: <span class="success">active (running)</span>'
    );
    ctx.addRawLine("Main PID: 443 (nginx)");
    return;
  }

  ctx.addLine("Unit not found.", "line error");
};
