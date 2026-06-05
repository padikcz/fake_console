window.PadikTerminalCommands.help = function (command, ctx) {
  const commands = Object.keys(window.PadikTerminalCommands)
    .filter(name => typeof window.PadikTerminalCommands[name] === "function")
    .sort();

  ctx.addRawLine("GNU bash, version 5.2.15(1)-release");
  ctx.addRawLine("These shell commands are defined internally.");
  ctx.addRawLine("");
  ctx.addRawLine("Built-in commands:");

  const columns = 4;

  for (let i = 0; i < commands.length; i += columns) {
    const row = commands
      .slice(i, i + columns)
      .map(name => name.padEnd(12, " "))
      .join("");

    ctx.addRawLine("  " + row.trimEnd());
  }
};
