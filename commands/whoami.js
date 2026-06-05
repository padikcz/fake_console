window.PadikTerminalCommands.whoami = function (command, ctx) {
  ctx.addRawLine(ctx.terminalUser);
};
