window.PadikTerminalCommands.rm = function (command, ctx) {
  const args = command.trim().split(/\s+/).slice(1);
  const targetArg = args.find(arg => !arg.startsWith("-"));

  if (!targetArg) {
    ctx.addLine("rm: missing operand", "line error");
    return;
  }

  const target = ctx.normalizePath(targetArg);
  const data = ctx.getParentAndName(target);

  if (
    !data.parent ||
    !data.parent.children ||
    !Object.prototype.hasOwnProperty.call(
      data.parent.children,
      data.name
    )
  ) {
    ctx.addLine(
      "rm: cannot remove '" +
      ctx.escapeHtml(targetArg) +
      "': No such file or directory",
      "line error"
    );
    return;
  }

  const node = data.parent.children[data.name];
  const recursive = args.some(
    arg => arg.startsWith("-") && arg.includes("r")
  );

  if (
    node.type === "dir" &&
    Object.keys(node.children || {}).length > 0 &&
    !recursive
  ) {
    ctx.addLine(
      "rm: cannot remove '" +
      ctx.escapeHtml(targetArg) +
      "': Is a directory",
      "line error"
    );
    return;
  }

  const critical =
    target === "/home/padik/data" ||
    target === "/home/padik/data/web" ||
    target === "/home/padik/data/web/index.html";

  delete data.parent.children[data.name];

  const currentPath = ctx.getCurrentPath();

  if (
    currentPath === target ||
    currentPath.startsWith(target + "/")
  ) {
    ctx.setCurrentPath("/home/padik");
    ctx.updatePrompt();
  }

  if (critical) {
    ctx.simulateWebsiteCrash();
  }
};
