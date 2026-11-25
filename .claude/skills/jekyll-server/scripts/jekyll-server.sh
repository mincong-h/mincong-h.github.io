#!/bin/bash
# Start the Jekyll server of the blog with the first Claude Code session, and stop it with that
# session. The Claude Code process that starts the server owns it: the next sessions reuse it, and
# only the owner stops it when it ends. A process, not a session ID, owns it, because /clear and
# /resume change the session ID but keep the process.
#
# Usage:
#   jekyll-server.sh session-start    hook SessionStart: reads the input of the hook on stdin
#   jekyll-server.sh session-end      hook SessionEnd: reads the input of the hook on stdin
#   jekyll-server.sh restart [opts]   restart the server with options of `jekyll serve`, such as
#                                     --incremental, and keep its owner
#   jekyll-server.sh status           print the port, the server, the owner and the log
#
# The variables JEKYLL_SERVER_PORT (default 4000) and JEKYLL_SERVER_STATE_DIR (default
# .claude/jekyll-server, ignored by Git) exist for the tests.
set -uo pipefail

ROOT=$(cd "$(dirname "$0")/../../../.." && pwd -P)
PORT=${JEKYLL_SERVER_PORT:-4000}
STATE_DIR=${JEKYLL_SERVER_STATE_DIR:-$ROOT/.claude/jekyll-server}
OWNER_FILE=$STATE_DIR/owner # PID of the Claude Code process that owns the server
PID_FILE=$STATE_DIR/pid     # PID of `jekyll serve`
LOG_FILE=$STATE_DIR/server.log
URL=http://127.0.0.1:$PORT/
SCRIPT=.claude/skills/jekyll-server/scripts/jekyll-server.sh

# The PID of the Claude Code process that runs this script. Claude Code sets CLAUDE_PID for its
# child processes. Otherwise, take the closest ancestor called "claude".
claude_pid() {
  if [ -n "${CLAUDE_PID:-}" ]; then
    echo "$CLAUDE_PID"
    return
  fi
  local p=$PPID
  while [ -n "$p" ] && [ "$p" -gt 1 ]; do
    case "$(ps -o comm= -p "$p")" in *claude) echo "$p"; return ;; esac
    p=$(ps -o ppid= -p "$p" | tr -d ' ')
  done
}

# Whether the PID $1 is a running Claude Code. The name protects from a reused PID. The native
# installation runs as "claude", the npm one as "node".
is_claude() {
  [ -n "$1" ] || return 1
  case "$(ps -o comm= -p "$1" 2>/dev/null)" in *claude | *node) return 0 ;; *) return 1 ;; esac
}

# The PID of the server that this script started, if it still runs `jekyll serve`.
server_pid() {
  local pid
  pid=$(cat "$PID_FILE" 2>/dev/null) || return 1
  ps -o args= -p "$pid" 2>/dev/null | grep -q 'jekyll serve' || return 1
  echo "$pid"
}

# The PID of the process that listens on the port, if any.
listener() {
  lsof -nP -iTCP:"$PORT" -sTCP:LISTEN -t 2>/dev/null | head -1
}

# Use the Ruby of .ruby-version if chruby has it, as the CI does. Otherwise, keep the Ruby of the
# PATH: the one of the shell that started Claude Code.
use_ruby() {
  local chruby_sh=/opt/homebrew/opt/chruby/share/chruby/chruby.sh want
  want=$(cat "$ROOT/.ruby-version" 2>/dev/null)
  if [ -n "$want" ] && [ -d "$HOME/.rubies/ruby-$want" ] && [ -f "$chruby_sh" ]; then
    # shellcheck source=/dev/null
    . "$chruby_sh" && chruby "ruby-$want"
  fi
}

# Start `jekyll serve` with the options $@, in its own session (setsid): it doesn't get the hangup
# of the terminal, and it doesn't keep the output of the hook open, so the hook returns at once.
start_server() {
  mkdir -p "$STATE_DIR"
  use_ruby
  cd "$ROOT" || return 1
  perl -MPOSIX -e 'POSIX::setsid(); exec @ARGV or die "exec: $!\n"' -- \
    bundle exec jekyll serve --port "$PORT" "$@" < /dev/null > "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
}

stop_server() {
  local pid
  if pid=$(server_pid); then
    kill "$pid" 2>/dev/null
  fi
  rm -f "$PID_FILE"
}

# The output of the hook SessionStart: $1 for the user (none if empty), $2 for Claude.
start_output() {
  jq -n --arg m "$1" --arg c "$2" \
    '{hookSpecificOutput: {hookEventName: "SessionStart", additionalContext: $c}}
     + (if $m == "" then {} else {systemMessage: $m} end)'
}

session_start() {
  local input cwd me owner pid other
  input=$(cat)
  cwd=$(jq -r '.cwd // empty' <<< "$input")
  cwd=$(cd "${cwd:-$PWD}" 2>/dev/null && pwd -P) || return 0
  # Only a session at the root of the main checkout: not in a subdirectory, not in a worktree.
  [ "$cwd" = "$ROOT" ] || return 0
  [ "$(git -C "$ROOT" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)" = "$ROOT/.git" ] || return 0
  me=$(claude_pid)
  [ -n "$me" ] || return 0
  owner=$(cat "$OWNER_FILE" 2>/dev/null)

  if pid=$(server_pid); then
    if [ "$owner" = "$me" ]; then
      start_output "" "The Jekyll server of the blog runs at $URL (PID $pid, log: $LOG_FILE). This session owns it: the hook SessionEnd stops it when this session ends. To change its mode, run \`$SCRIPT restart [--incremental]\`, not \`jekyll serve\`."
    elif is_claude "$owner"; then
      start_output "Jekyll server already running at $URL, owned by another Claude Code session" \
        "The Jekyll server of the blog runs at $URL (PID $pid, log: $LOG_FILE). Another Claude Code session (PID $owner) started it and stops it when it ends: don't stop it, and don't start another server."
    else
      echo "$me" > "$OWNER_FILE"
      start_output "Jekyll server already running at $URL: its session ended, so this session owns it now" \
        "The Jekyll server of the blog runs at $URL (PID $pid, log: $LOG_FILE). The session that started it ended without stopping it, so this session owns it now: the hook SessionEnd stops it when this session ends. To change its mode, run \`$SCRIPT restart [--incremental]\`, not \`jekyll serve\`."
    fi
  elif other=$(listener) && [ -n "$other" ]; then
    start_output "Port $PORT already in use: the Jekyll server was not started" \
      "A process that the hook SessionStart didn't start listens on the port $PORT (PID $other: $(ps -o args= -p "$other" | cut -c1-100)). It may run in a terminal of the user: ask them before stopping it."
  else
    start_server
    echo "$me" > "$OWNER_FILE"
    start_output "Starting the Jekyll server at $URL (full build)" \
      "The hook SessionStart started the Jekyll server of the blog with a full build (\`bundle exec jekyll serve\`, PID $(cat "$PID_FILE"), log: $LOG_FILE). It answers at $URL after about 10 seconds. This session owns it: the hook SessionEnd stops it when this session ends. Don't start another server. To change its mode, run \`$SCRIPT restart [--incremental]\`."
  fi
}

session_end() {
  local input reason me
  input=$(cat)
  reason=$(jq -r '.reason // empty' <<< "$input")
  # After /clear or /resume, the same Claude Code process goes on with another session.
  case "$reason" in clear | resume) return 0 ;; esac
  me=$(claude_pid)
  [ -n "$me" ] && [ "$(cat "$OWNER_FILE" 2>/dev/null)" = "$me" ] || return 0
  stop_server
  rm -f "$OWNER_FILE"
}

restart() {
  local owner other
  owner=$(cat "$OWNER_FILE" 2>/dev/null)
  stop_server
  for _ in $(seq 1 50); do
    [ -z "$(listener)" ] && break
    sleep 0.1
  done
  if other=$(listener) && [ -n "$other" ]; then
    echo "The port $PORT is still in use by PID $other: $(ps -o args= -p "$other")" >&2
    return 1
  fi
  start_server "$@"
  is_claude "$owner" || owner=$(claude_pid)
  if [ -n "$owner" ]; then echo "$owner" > "$OWNER_FILE"; else rm -f "$OWNER_FILE"; fi
  echo "Started \`jekyll serve $*\` (PID $(cat "$PID_FILE"), owner: ${owner:-none}), log: $LOG_FILE"
}

status() {
  echo "port:   $PORT, listener: $(listener || true)"
  echo "server: $(server_pid || echo none)"
  echo "owner:  $(cat "$OWNER_FILE" 2>/dev/null || echo none)"
  echo "log:    $LOG_FILE"
}

case "${1:-}" in
  session-start) session_start ;;
  session-end) session_end ;;
  restart) shift; restart "$@" ;;
  status) status ;;
  *) sed -n '2,16p' "$0" >&2; exit 2 ;;
esac
