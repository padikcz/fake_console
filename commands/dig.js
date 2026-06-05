window.PadikTerminalCommands.dig = function (command, ctx) {
  const args = command.trim().split(/\s+/).slice(1);
  const full = args.join(" ");

  if (!full.includes("padik.eu")) {
    ctx.addLine("status: NXDOMAIN", "line error");
    return;
  }

  ctx.addRawLine("; <<>> DiG 9.18 <<>> padik.eu A");
  ctx.addLine('status: <span class="success">NOERROR</span>');
  ctx.addRawLine("answer: padik.eu → server IP");
};
