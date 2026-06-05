window.PadikTerminalCommands.echo = function (command, ctx) {
  const text = command.replace(/^\s*echo(?:\s+|$)/i, "");
  ctx.addRawLine(text);
};
