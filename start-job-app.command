#!/bin/zsh

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

if ! command -v npm >/dev/null 2>&1; then
  echo "npm が見つかりません。先に Node.js をインストールしてください。"
  echo "https://nodejs.org/"
  read "?Enterキーで終了します..."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "依存関係をインストールしています..."
  npm install || exit 1
fi

if lsof -i tcp:3000 >/dev/null 2>&1; then
  echo "既に http://localhost:3000 で起動しています。"
  open "http://localhost:3000"
  read "?Enterキーでこのウィンドウを閉じます..."
  exit 0
fi

mkdir -p .run
echo "開発サーバーを起動しています..."
nohup npm run dev > .run/dev.log 2>&1 < /dev/null &
SERVER_PID=$!
echo "$SERVER_PID" > .run/dev.pid

for _ in {1..30}; do
  if lsof -i tcp:3000 >/dev/null 2>&1; then
    echo "http://localhost:3000 を開きます..."
    open "http://localhost:3000"
    echo "アプリを起動しました。"
    echo "ログ: $SCRIPT_DIR/.run/dev.log"
    read "?Enterキーでこのウィンドウを閉じます..."
    exit 0
  fi
  sleep 1
done

echo "サーバーの起動確認に失敗しました。"
echo "ログを確認してください: $SCRIPT_DIR/.run/dev.log"
read "?Enterキーでこのウィンドウを閉じます..."
exit 1
