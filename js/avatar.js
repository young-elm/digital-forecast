// 虚拟形象：按参数分层的 SVG 小人（背景 / 氛围 / 姿态 / 发型 / 表情 / 手持物 / 徽章）
// 全部用几何图元画，不依赖任何图片素材，改配色或加部件都只动这个文件。

const AVATAR_VIEW = { w: 320, h: 380 };

function skinTone(hue) {
  return `hsl(${(hue + 24) % 360} 55% 82%)`;
}

function shade(hue, sat, l) {
  return `hsl(${hue} ${sat}% ${l}%)`;
}

// ---------- 手持物 ----------
const PROPS = {
  laptop: `<rect x="-17" y="-6" width="34" height="20" rx="3" fill="${'var(--prop-dark)'}"/><rect x="-14" y="-3" width="28" height="14" rx="2" fill="var(--prop-light)"/>`,
  code: `<rect x="-16" y="-12" width="32" height="24" rx="4" fill="var(--prop-dark)"/><text x="0" y="4" font-size="13" font-family="monospace" text-anchor="middle" fill="var(--prop-light)">&lt;/&gt;</text>`,
  chart: `<rect x="-16" y="-14" width="32" height="28" rx="3" fill="var(--prop-light)"/><rect x="-11" y="0" width="5" height="10" fill="var(--prop-dark)"/><rect x="-3" y="-6" width="5" height="16" fill="var(--prop-accent)"/><rect x="5" y="-10" width="5" height="20" fill="var(--prop-dark)"/>`,
  gavel: `<rect x="-14" y="-14" width="24" height="9" rx="3" transform="rotate(-30)" fill="var(--prop-dark)"/><rect x="-6" y="6" width="22" height="5" rx="2" fill="var(--prop-accent)"/>`,
  book: `<path d="M-16,-11 h14 a2,2 0 0 1 2,2 v20 h-16 z" fill="var(--prop-light)"/><path d="M16,-11 h-14 a2,2 0 0 0 -2,2 v20 h16 z" fill="var(--prop-accent)"/>`,
  mic: `<circle cx="0" cy="-9" r="8" fill="var(--prop-dark)"/><rect x="-2.5" y="-3" width="5" height="16" rx="2.5" fill="var(--prop-accent)"/>`,
  brush: `<rect x="-3" y="-16" width="6" height="20" rx="3" fill="var(--prop-dark)"/><path d="M-4,3 h8 l-2,11 h-4 z" fill="var(--prop-accent)"/>`,
  plant: `<path d="M-9,4 h18 l-3,14 h-12 z" fill="var(--prop-dark)"/><circle cx="-5" cy="-3" r="7" fill="var(--prop-accent)"/><circle cx="6" cy="-6" r="6" fill="var(--prop-light)"/>`,
  people: `<circle cx="-7" cy="-6" r="7" fill="var(--prop-accent)"/><circle cx="8" cy="-3" r="6" fill="var(--prop-light)"/><path d="M-16,12 a9,9 0 0 1 18,0 z" fill="var(--prop-dark)"/><path d="M2,12 a8,8 0 0 1 15,0 z" fill="var(--prop-accent)"/>`,
  stage: `<path d="M-14,-12 h28 l-6,24 h-16 z" fill="var(--prop-light)" opacity=".85"/><circle cx="0" cy="-12" r="6" fill="var(--prop-accent)"/>`,
  camera: `<rect x="-16" y="-9" width="32" height="20" rx="4" fill="var(--prop-dark)"/><circle cx="0" cy="1" r="7" fill="var(--prop-light)"/><circle cx="0" cy="1" r="3" fill="var(--prop-accent)"/>`,
  stethoscope: `<path d="M-11,-12 v8 a11,11 0 0 0 22,0 v-8" fill="none" stroke="var(--prop-dark)" stroke-width="3.5" stroke-linecap="round"/><circle cx="0" cy="8" r="6" fill="var(--prop-accent)"/>`,
  wrench: `<rect x="-3.5" y="-6" width="7" height="20" rx="3" fill="var(--prop-dark)"/><path d="M-9,-11 a9,9 0 1 1 18,0 l-4,3 -10,0 z" fill="var(--prop-accent)"/>`,
  none: `<circle cx="0" cy="0" r="9" fill="var(--prop-accent)" opacity=".7"/>`,
};

// ---------- 头饰 / 超能力配件 ----------
const ACCESSORIES = {
  ear: `<path d="M148,118 q22,-6 20,22 q-2,14 -14,12" fill="none" stroke="var(--acc)" stroke-width="5" stroke-linecap="round"/><path d="M182,108 q14,10 8,30" fill="none" stroke="var(--acc)" stroke-width="3" stroke-linecap="round" opacity=".6"/><path d="M194,100 q20,16 10,46" fill="none" stroke="var(--acc)" stroke-width="3" stroke-linecap="round" opacity=".35"/>`,
  veil: `<path d="M104,116 q46,-26 92,0 q-4,52 -46,64 q-42,-12 -46,-64 z" fill="var(--acc)" opacity=".22"/><path d="M104,116 q46,-26 92,0" fill="none" stroke="var(--acc)" stroke-width="3" opacity=".5"/>`,
  clock: `<circle cx="216" cy="70" r="17" fill="none" stroke="var(--acc)" stroke-width="4"/><path d="M216,58 v12 l9,5" fill="none" stroke="var(--acc)" stroke-width="3.5" stroke-linecap="round"/>`,
  loop: `<path d="M206,66 a17,17 0 1 0 14,10" fill="none" stroke="var(--acc)" stroke-width="4" stroke-linecap="round"/><path d="M206,66 l-12,-4 l4,14 z" fill="var(--acc)"/>`,
  none: '',
};

// ---------- 背景氛围 ----------
function auraLayer(p) {
  const a = p.aura;
  if (a === 'star') {
    return `
      <g fill="var(--aura)" opacity=".9">
        ${[[70, 74, 13], [250, 108, 9], [232, 250, 11], [82, 268, 7], [150, 44, 8]]
          .map(([x, y, r]) => `<path d="M${x},${y - r} l${r * 0.3},${r * 0.7} ${r},0 l-${r * 0.65},${r * 0.55} ${r * 0.2},${r} z" opacity=".8"/>`).join('')}
      </g>
      <circle cx="160" cy="176" r="112" fill="none" stroke="var(--aura)" stroke-width="2" stroke-dasharray="3 9" opacity=".7"/>`;
  }
  if (a === 'moon') {
    return `
      <path d="M258,50 a28,28 0 1 0 22,44 a23,23 0 1 1 -22,-44 z" fill="var(--aura)" opacity=".85"/>
      ${[[72, 96], [96, 208], [250, 232]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.5" fill="var(--aura)" opacity=".7"/>`).join('')}
      <path d="M60,300 q100,-26 200,0" fill="none" stroke="var(--aura)" stroke-width="2" opacity=".45"/>`;
  }
  if (a === 'bloom') {
    return `
      ${[[74, 92], [246, 120], [66, 236], [252, 258], [160, 52]].map(([x, y], i) =>
        `<g opacity=".7"><circle cx="${x}" cy="${y}" r="${9 - i}" fill="var(--aura)"/><circle cx="${x + 11}" cy="${y + 4}" r="${6 - i * 0.4}" fill="var(--aura)" opacity=".6"/></g>`).join('')}`;
  }
  return `<circle cx="160" cy="176" r="104" fill="var(--aura)" opacity=".14"/>`;
}

// ---------- 身体姿态 ----------
function bodyLayer(p) {
  const c = 'var(--cloth)';
  if (p.pose === 'open') {
    return `
      <path d="M118,240 q42,-16 84,0 l10,74 q-52,12 -104,0 z" fill="${c}"/>
      <path d="M120,250 q-30,-24 -44,-44" fill="none" stroke="${c}" stroke-width="17" stroke-linecap="round"/>
      <path d="M200,250 q30,-24 44,-44" fill="none" stroke="${c}" stroke-width="17" stroke-linecap="round"/>
      <circle cx="76" cy="204" r="10" fill="var(--skin)"/>
      <circle cx="244" cy="204" r="10" fill="var(--skin)"/>`;
  }
  return `
    <path d="M126,244 q34,-12 68,0 l6,58 q-40,10 -80,0 z" fill="${c}"/>
    <path d="M132,256 q-18,20 -6,44" fill="none" stroke="${c}" stroke-width="16" stroke-linecap="round"/>
    <path d="M188,256 q18,20 6,44" fill="none" stroke="${c}" stroke-width="16" stroke-linecap="round"/>
    <ellipse cx="160" cy="322" rx="66" ry="16" fill="${c}" opacity=".55"/>
    <circle cx="128" cy="300" r="9" fill="var(--skin)"/>
    <circle cx="192" cy="300" r="9" fill="var(--skin)"/>`;
}

// ---------- 发型 ----------
function hairLayer(p) {
  const h = 'var(--hair)';
  if (p.hair === 'neat') {
    return `
      <path d="M102,152 A58,58 0 0 1 218,152 L218,147 C213,126 194,118 160,118 C126,118 107,126 102,147 Z" fill="${h}"/>
      <path d="M104,150 q-7,28 -2,46" fill="none" stroke="${h}" stroke-width="15" stroke-linecap="round"/>
      <path d="M216,150 q7,28 2,46" fill="none" stroke="${h}" stroke-width="15" stroke-linecap="round"/>
      <path d="M160,119 v-12" stroke="rgba(255,255,255,.2)" stroke-width="3" stroke-linecap="round"/>`;
  }
  return `
    <path d="M101,152 A58,58 0 0 1 219,152 L219,146 C212,128 199,120 188,127 C176,134 162,116 142,122 C126,127 108,132 101,146 Z" fill="${h}"/>
    <path d="M96,114 q-15,-15 -5,-31" fill="none" stroke="${h}" stroke-width="8" stroke-linecap="round"/>
    <path d="M223,110 q16,-11 12,-28" fill="none" stroke="${h}" stroke-width="8" stroke-linecap="round"/>
    <path d="M168,98 q17,-13 34,-6" fill="none" stroke="${h}" stroke-width="7" stroke-linecap="round" opacity=".9"/>`;
}

// ---------- 五官 ----------
function faceLayer(p) {
  const eyeY = p.gaze === 'up' ? 150 : 156;
  const pupilDy = p.gaze === 'up' ? -3 : 2;
  const brows = p.face === 'level'
    ? `<path d="M126,${eyeY - 20} h20" stroke="var(--hair)" stroke-width="4.5" stroke-linecap="round" fill="none"/>
       <path d="M174,${eyeY - 20} h20" stroke="var(--hair)" stroke-width="4.5" stroke-linecap="round" fill="none"/>`
    : `<path d="M126,${eyeY - 16} q10,-7 20,-1" stroke="var(--hair)" stroke-width="4" stroke-linecap="round" fill="none"/>
       <path d="M174,${eyeY - 17} q10,-6 20,1" stroke="var(--hair)" stroke-width="4" stroke-linecap="round" fill="none"/>`;
  const mouth = p.face === 'level'
    ? `<path d="M148,186 h24" stroke="var(--line)" stroke-width="4" stroke-linecap="round" fill="none"/>`
    : `<path d="M146,182 q14,12 28,0" stroke="var(--line)" stroke-width="4" stroke-linecap="round" fill="none"/>`;
  const blush = p.face === 'soft'
    ? `<circle cx="120" cy="172" r="8" fill="var(--blush)" opacity=".55"/><circle cx="200" cy="172" r="8" fill="var(--blush)" opacity=".55"/>`
    : '';
  return `
    ${brows}
    <ellipse cx="136" cy="${eyeY}" rx="7" ry="8.5" fill="var(--line)"/>
    <ellipse cx="184" cy="${eyeY}" rx="7" ry="8.5" fill="var(--line)"/>
    <circle cx="138" cy="${eyeY + pupilDy}" r="2.6" fill="#fff" opacity=".9"/>
    <circle cx="186" cy="${eyeY + pupilDy}" r="2.6" fill="#fff" opacity=".9"/>
    ${blush}${mouth}`;
}

// ---------- 主渲染 ----------
function renderAvatar(p) {
  const bg1 = shade(p.hue, p.sat, 22);
  const bg2 = shade((p.hue + 38) % 360, p.sat, 40);
  const css = `
    .av { --bg1:${bg1}; --bg2:${bg2};
      --aura:${shade(p.accentHue, 80, 74)};
      --cloth:${shade(p.accentHue, p.sat + 6, 52)};
      --hair:${shade((p.hue + 12) % 360, Math.min(p.sat + 14, 78), 30)};
      --skin:${skinTone(p.hue)};
      --line:#241d2c;
      --blush:${shade((p.hue + 320) % 360, 78, 74)};
      --acc:${shade(p.accentHue, 88, 80)};
      --prop-dark:${shade((p.hue + 200) % 360, 30, 24)};
      --prop-light:${shade(p.accentHue, 74, 82)};
      --prop-accent:${shade(p.accentHue, 82, 60)};
      --badge:${shade(p.hue, 70, 30)}; }
  `;
  const prop = PROPS[p.prop] || PROPS.none;
  const propPos = p.pose === 'open' ? 'translate(238,206)' : 'translate(196,296)';

  return `
<svg class="av" viewBox="0 0 ${AVATAR_VIEW.w} ${AVATAR_VIEW.h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="你的专属虚拟形象">
  <style>${css}</style>
  <defs>
    <linearGradient id="avbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" style="stop-color:var(--bg1)"/><stop offset="1" style="stop-color:var(--bg2)"/>
    </linearGradient>
  </defs>
  <rect width="${AVATAR_VIEW.w}" height="${AVATAR_VIEW.h}" rx="26" fill="url(#avbg)"/>
  ${auraLayer(p)}
  ${p.spark ? `<g fill="var(--acc)" opacity=".85"><circle cx="52" cy="150" r="3.5"/><circle cx="272" cy="176" r="4"/><circle cx="120" cy="70" r="3"/></g>` : ''}
  ${p.shield ? `<path d="M160,58 l70,20 v78 q0,64 -70,84 q-70,-20 -70,-84 v-78 z" fill="none" stroke="var(--acc)" stroke-width="3" opacity=".4" stroke-dasharray="10 7"/>` : ''}
  <g>
    <circle cx="160" cy="152" r="54" fill="var(--skin)"/>
    ${bodyLayer(p)}
    ${hairLayer(p)}
    ${faceLayer(p)}
    ${ACCESSORIES[p.accessory] || ''}
  </g>
  <g transform="${propPos}">${prop}</g>
  <g transform="translate(160,352)">
    <rect x="-42" y="-15" width="84" height="30" rx="15" fill="var(--badge)" opacity=".92"/>
    <text x="0" y="6" text-anchor="middle" font-size="16" font-weight="700" letter-spacing="2"
      font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif" fill="#fff">${p.badge}</text>
  </g>
</svg>`;
}
