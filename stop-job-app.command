#!/bin/zsh

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

if [ -f .run/dev.pid ]; then
  PID="$(cat .run/dev.pid)"
  if kill -0 "$PID" >/dev/null 2>&1; then
    kill "$PID"
    echo "就活app を停止しました。"
  else
    echo "起動中のプロセスは見つかりませんでした。"
  fi
  rm -f .run/dev.pid
else
  if lsof -ti tcp:3000 >/dev/null 2>&1; then
    lsof -ti tcp:3000 | xargs kill
    echo "3000番ポートの就活appを停止しました。"
  else
    echo "起動中のプロセスは見つかりませんでした。"
  fi
fi

read "?Enterキーでこのウィンドウを閉じます..."
