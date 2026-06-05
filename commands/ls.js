window.PadikTerminalCommands.ls = function (command, ctx) {
  const args = command.trim().split(/\s+/).slice(1);
  const pathArg = args.find(arg => !arg.startsWith("-"));
  const target = pathArg
    ? ctx.normalizePath(pathArg)
    : ctx.getCurrentPath();

  ctx.listDirectory(target);
};
