#!/usr/bin/env bash
# 冒烟测试：注册 → 登录 → 创建文章 → 按 slug 拉取。
# 要求后端在 8080 端口运行；输出可读 JSON。
set -euo pipefail

BASE="${BASE:-http://localhost:8080/api/v1}"
USER="smoke_$(date +%s)"
PASS="smoke-pass-1234"
JAR="$(mktemp)"
trap "rm -f $JAR" EXIT

say() { printf "\n\033[1;34m▶ %s\033[0m\n" "$*"; }

say "1) healthz"
curl -sS -X GET "$BASE/healthz" | tee /dev/stderr | grep -q '"code":0' \
  || curl -sS -X GET "$BASE/healthz"

say "2) register $USER"
curl -sS -X POST "$BASE/users/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USER\",\"password\":\"$PASS\",\"email\":\"$USER@example.com\"}"

say "3) login → save cookie to $JAR"
LOGIN_JSON=$(curl -sS -c "$JAR" -X POST "$BASE/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USER\",\"password\":\"$PASS\"}")
echo "$LOGIN_JSON"
TOKEN=$(printf '%s' "$LOGIN_JSON" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
test -n "$TOKEN" || { echo "未拿到 token"; exit 1; }

say "4) create article (Bearer)"
CREATE_JSON=$(curl -sS -X POST "$BASE/articles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Smoke","content":"hello","description":"smoke","status":1,"category_id":0}')
echo "$CREATE_JSON"
SLUG=$(printf '%s' "$CREATE_JSON" | sed -n 's/.*"slug":"\([^"]*\)".*/\1/p')
test -n "$SLUG" || { echo "未拿到 slug"; exit 1; }

say "5) fetch article by slug"
curl -sS "$BASE/articles/slug/$SLUG"

say "6) list slugs (ISR)"
curl -sS "$BASE/articles/slugs"

say "7) logout (Cookie)"
curl -sS -b "$JAR" -X POST "$BASE/users/logout" \
  -H "Authorization: Bearer $TOKEN"

say "✓ smoke ok"