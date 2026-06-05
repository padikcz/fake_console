window.PadikTerminalCommands.help = function (command, ctx) {
  ctx.addRawLine("GNU bash, version 5.2.15(1)-release");
  ctx.addRawLine("These shell commands are defined internally.");
  ctx.addRawLine("");
  ctx.addRawLine("Built-in commands:");
  ctx.addRawLine("  cd        clear     echo      help");
  ctx.addRawLine("  pwd       ls        cat       rm");
  ctx.addRawLine("  mkdir     touch     date      whoami");
  ctx.addRawLine("  curl      dig       systemctl");
};
