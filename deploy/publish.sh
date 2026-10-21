#!/usr/bin/env bash
# 在服务器上执行：把上传的 tgz 发布到站点目录。
# 先解到临时目录并校验，确认包是完整的才替换线上，失败不会把站点搞坏。
set -euo pipefail

WEB_ROOT="${2:-${WEB_ROOT:-/var/www/digital-forecast}}"
TGZ="${1:?用法: publish.sh /tmp/xxx.tgz [/var/www/digital-forecast]}"
STAGE="$(mktemp -d)"

tar -xzf "$TGZ" -C "$STAGE"
[ -f "$STAGE/index.html" ] || { echo "包里缺 index.html，放弃发布"; rm -rf "$STAGE"; exit 1; }

[ -d "$WEB_ROOT" ] && { rm -rf "$WEB_ROOT.old"; mv "$WEB_ROOT" "$WEB_ROOT.old"; }
mv "$STAGE" "$WEB_ROOT"
rm -f "$TGZ"

nginx -t && systemctl reload nginx
echo "已发布 $(du -sh "$WEB_ROOT" | cut -f1)，上一版留在 ${WEB_ROOT}.old（回滚：rm -rf $WEB_ROOT && mv $WEB_ROOT.old $WEB_ROOT）"
