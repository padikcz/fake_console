window.PadikTerminalCommands.cat = function (command, ctx) {
  const args = command.trim().split(/\s+/).slice(1);

  if (!args[0]) {
    ctx.addLine("cat: missing operand", "line error");
    return;
  }

  const target = ctx.normalizePath(args[0]);
  const node = ctx.getNode(target);

  if (!node) {
    ctx.addLine(
      "cat: " + ctx.escapeHtml(args[0]) +
      ": No such file or directory",
      "line error"
    );
    return;
  }

  if (node.type !== "file") {
    ctx.addLine(
      "cat: " + ctx.escapeHtml(args[0]) +
      ": Is a directory",
      "line error"
    );
    return;
  }

  if (node.tooLarge) {
    ctx.addLine(
      "cat: " + ctx.escapeHtml(args[0]) +
      ": file is too large",
      "line error"
    );
    return;
  }

  ctx.addRawLine(node.content || "");
};
