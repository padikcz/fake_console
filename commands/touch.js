window.PadikTerminalCommands.touch = function (command, ctx) {
  const args = command.trim().split(/\s+/).slice(1);

  if (!args[0]) {
    ctx.addLine("touch: missing file operand", "line error");
    return;
  }

  const target = ctx.normalizePath(args[0]);
  const data = ctx.getParentAndName(target);

  if (!data.parent || data.parent.type !== "dir") {
    ctx.addLine(
      "touch: cannot touch '" + ctx.escapeHtml(args[0]) +
      "': No such file or directory",
      "line error"
    );
    return;
  }

  if (!data.parent.children[data.name]) {
    data.parent.children[data.name] = {
      type: "file",
      content: ""
    };
  }
};
