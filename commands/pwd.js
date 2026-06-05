window.PadikTerminalCommands.pwd = function (command, ctx) {
  ctx.addRawLine(ctx.displayPath(ctx.getCurrentPath()));
};
