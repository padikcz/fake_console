window.PadikTerminalCommands.mkdir = function (command, ctx) {
  const args = command.trim().split(/\s+/).slice(1);

  if (!args[0]) {
    ctx.addLine("mkdir: missing operand", "line error");
    return;
  }

  const target = ctx.normalizePath(args[0]);
  const data = ctx.getParentAndName(target);

  if (!data.parent || data.parent.type !== "dir") {
    ctx.addLine(
      "mkdir: cannot create directory '" +
      ctx.escapeHtml(args[0]) +
      "': No such file or directory",
      "line error"
    );
    return;
  }

  if (data.parent.children[data.name]) {
    ctx.addLine(
      "mkdir: cannot create directory '" +
      ctx.escapeHtml(args[0]) +
      "': File exists",
      "line error"
    );
    return;
  }

  data.parent.children[data.name] = {
    type: "dir",
    children: {}
  };
};
