window.PadikTerminalCommands.date = function (command, ctx) {
  ctx.addRawLine(new Date().toLocaleString("cs-CZ"));
};
