/* ══════════════════════════════════════════════════════════════
   BLACKOUT — avatares procedurales
   Genera una "cara" siniestra en SVG, determinista según el
   nombre del jugador (misma cara en todos los dispositivos).
   ══════════════════════════════════════════════════════════════ */

const Avatars = (() => {
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // Generador determinista simple a partir del hash.
  function rng(seed) {
    let s = seed;
    return () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  const PALETTES = [
    { skin: '#c9c2b2', eye: '#e02b33', mark: '#6b1015' },
    { skin: '#aeb6ad', eye: '#e8d24a', mark: '#3c4a3e' },
    { skin: '#b7a8b8', eye: '#6ea8a0', mark: '#4a3050' },
    { skin: '#c4b49a', eye: '#ffffff', mark: '#7a1a1a' },
    { skin: '#9fa8b5', eye: '#ff7b2b', mark: '#25313f' },
    { skin: '#bdb0a0', eye: '#9fe06a', mark: '#503a26' },
  ];

  /**
   * Devuelve el markup SVG de la cara para un nombre dado.
   */
  function faceSVG(name) {
    const r = rng(hash(name.toLowerCase()));
    const pal = PALETTES[Math.floor(r() * PALETTES.length)];

    const headW = 56 + r() * 18;          // anchura del cráneo
    const jaw = 18 + r() * 14;            // caída de la mandíbula
    const eyeY = 40 + r() * 8;
    const eyeDX = 13 + r() * 6;
    const eyeR = 4.5 + r() * 3;
    const tilt = (r() - 0.5) * 10;        // cabeza ladeada
    const mouthType = Math.floor(r() * 3); // 0 cosido, 1 abierto, 2 sonrisa
    const hasCrack = r() > 0.45;
    const hasScar = r() > 0.5;

    const cx = 50;
    const left = cx - headW / 2;
    const right = cx + headW / 2;

    let mouth = '';
    if (mouthType === 0) {
      // boca cosida
      mouth = `<line x1="${cx - 12}" y1="68" x2="${cx + 12}" y2="68" stroke="${pal.mark}" stroke-width="2.4"/>` +
        [-8, -3, 2, 7].map((dx) =>
          `<line x1="${cx + dx}" y1="64" x2="${cx + dx + 1.5}" y2="72" stroke="${pal.mark}" stroke-width="1.6"/>`
        ).join('');
    } else if (mouthType === 1) {
      // boca abierta (grito)
      mouth = `<ellipse cx="${cx}" cy="69" rx="7" ry="${6 + r() * 5}" fill="#120a0c"/>`;
    } else {
      // sonrisa torcida
      mouth = `<path d="M ${cx - 13} 66 Q ${cx} ${74 + r() * 6} ${cx + 13} 64" fill="none" stroke="${pal.mark}" stroke-width="2.6" stroke-linecap="round"/>`;
    }

    const crack = hasCrack
      ? `<path d="M ${cx + 6} 12 L ${cx + 2} 24 L ${cx + 9} 30 L ${cx + 4} 40" fill="none" stroke="${pal.mark}" stroke-width="1.6" opacity="0.8"/>`
      : '';
    const scar = hasScar
      ? `<line x1="${cx - eyeDX - 6}" y1="${eyeY - 10}" x2="${cx - eyeDX + 5}" y2="${eyeY + 9}" stroke="${pal.mark}" stroke-width="1.6" opacity="0.7"/>`
      : '';

    return `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="cara de ${escapeAttr(name)}">
  <g transform="rotate(${tilt.toFixed(1)} 50 50)">
    <path d="M ${left} 42
             Q ${left} 8 ${cx} 8
             Q ${right} 8 ${right} 42
             Q ${right} ${58 + jaw / 2} ${cx + jaw / 2} ${74 + jaw / 2}
             L ${cx - jaw / 2} ${74 + jaw / 2}
             Q ${left} ${58 + jaw / 2} ${left} 42 Z"
          fill="${pal.skin}" stroke="#0a0809" stroke-width="2"/>
    <ellipse cx="${cx - eyeDX}" cy="${eyeY}" rx="${eyeR + 3.5}" ry="${eyeR + 4.5}" fill="#0e0a0c"/>
    <ellipse cx="${cx + eyeDX}" cy="${eyeY + (r() - 0.5) * 4}" rx="${eyeR + 3.5}" ry="${eyeR + 4.5}" fill="#0e0a0c"/>
    <circle cx="${cx - eyeDX}" cy="${eyeY}" r="${eyeR * 0.55}" fill="${pal.eye}">
      <animate attributeName="opacity" values="1;1;0.15;1" dur="${(3 + r() * 4).toFixed(1)}s" repeatCount="indefinite"/>
    </circle>
    <circle cx="${cx + eyeDX}" cy="${eyeY + (r() - 0.5) * 4}" r="${eyeR * 0.55}" fill="${pal.eye}">
      <animate attributeName="opacity" values="1;0.15;1;1" dur="${(3 + r() * 4).toFixed(1)}s" repeatCount="indefinite"/>
    </circle>
    <ellipse cx="${cx}" cy="${eyeY + 13}" rx="3" ry="4.5" fill="#0e0a0c" opacity="0.85"/>
    ${mouth}
    ${crack}
    ${scar}
  </g>
</svg>`;
  }

  function escapeAttr(s) {
    return s.replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  return { faceSVG };
})();
