window.PadikTerminalCommands.cd = function (command, ctx) {
  const args = command.trim().split(/\s+/).slice(1);
  const target = args[0]
    ? ctx.normalizePath(args[0])
    : "/home/padik";

  const node = ctx.getNode(target);

  if (!node) {
    ctx.addLine(
      "bash: cd: " + ctx.escapeHtml(args[0] || "") +
      ": No such file or directory",
      "line error"
    );
    return;
  }

  if (node.type !== "dir") {
    ctx.addLine(
      "bash: cd: " + ctx.escapeHtml(args[0] || "") +
      ": Not a directory",
      "line error"
    );
    return;
  }

  ctx.setCurrentPath(target);
  ctx.updatePrompt();
};
