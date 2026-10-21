// 分享卡片：用 canvas 手绘一张适合发朋友圈的竖版图
// 头像直接把 avatar.js 产出的 SVG 当图片画进去，所以形象改动会自动同步到卡片上。

function svgToImage(svg, size) {
  const withSize = svg.replace('<svg ', `<svg width="${size.w}" height="${size.h}" `);
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(withSize);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('形象图片渲染失败'));
    img.src = url;
  });
}

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  let line = '';
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxWidth && line) {
      lines.push(line);
      line = ch === ' ' ? '' : ch;
    } else {
      line += ch;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const FONT = '"PingFang SC","Microsoft YaHei","Segoe UI",system-ui,sans-serif';

async function buildShareCard(result, copyIndex) {
  const W = 1000, H = 1500;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const p = result.avatar;

  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, `hsl(${p.hue} ${p.sat}% 16%)`);
  g.addColorStop(0.55, `hsl(${(p.hue + 22) % 360} ${p.sat - 8}% 24%)`);
  g.addColorStop(1, `hsl(${p.accentHue} ${Math.min(p.sat + 10, 70)}% 18%)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(255,255,255,.14)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(W / 2, 470, 300, 0, Math.PI * 2);
  ctx.stroke();

  const img = await svgToImage(renderAvatar(p), { w: AVATAR_VIEW.w, h: AVATAR_VIEW.h });
  const scale = 560 / AVATAR_VIEW.h;
  ctx.drawImage(img, (W - AVATAR_VIEW.w * scale) / 2, 150, AVATAR_VIEW.w * scale, AVATAR_VIEW.h * scale);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.font = `800 96px ${FONT}`;
  ctx.fillText(result.type, W / 2, 830);

  ctx.fillStyle = `hsl(${p.accentHue} 80% 76%)`;
  ctx.font = `700 40px ${FONT}`;
  ctx.fillText(result.info.nickname + ' · ' + TEMPERAMENT[result.info.temperament].name, W / 2, 890);

  ctx.font = `400 30px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,.82)';
  const one = wrapText(ctx, result.info.oneLiner, W - 220);
  one.forEach((l, i) => ctx.fillText(l, W / 2, 950 + i * 44));

  // 标签条
  const tags = result.tags.slice(0, 3);
  ctx.font = `600 30px ${FONT}`;
  const widths = tags.map((t) => ctx.measureText(t.name).width + 46);
  let x = (W - (widths.reduce((a, b) => a + b, 0) + (tags.length - 1) * 16)) / 2;
  const ty = 1050;
  tags.forEach((t, i) => {
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    roundRect(ctx, x, ty, widths[i], 58, 29);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.22)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(t.name, x + widths[i] / 2, ty + 39);
    x += widths[i] + 16;
  });

  // 职业方向
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,.5)';
  ctx.font = `600 24px ${FONT}`;
  ctx.fillText('职 业 方 向', 90, 1170);
  ctx.fillStyle = '#fff';
  ctx.font = `700 38px ${FONT}`;
  ctx.fillText(result.careers.map((c) => c.name).join('  /  '), 90, 1220);

  // 朋友圈文案
  const copy = result.copies[copyIndex || 0].text;
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  roundRect(ctx, 90, 1280, W - 180, 150, 24);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  ctx.font = `400 28px ${FONT}`;
  const lines = wrapText(ctx, copy, W - 260).slice(0, 3);
  lines.forEach((l, i) => ctx.fillText(l, 120, 1330 + i * 40));

  ctx.fillStyle = 'rgba(255,255,255,.42)';
  ctx.font = `400 22px ${FONT}`;
  ctx.textAlign = 'center';
  const d = new Date();
  ctx.fillText(`数字预测 · 档案号 ${result.fingerprint} · ${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`, W / 2, 1478);

  return canvas;
}

async function downloadShareCard(result, copyIndex) {
  const canvas = await buildShareCard(result, copyIndex);
  const a = document.createElement('a');
  a.download = `数字预测-${result.type}-${result.fingerprint}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
  return a.href;
}
