// Floor plans ported 1:1 from the design board; shown over the listing photo on hover.

const plans = {
  p2: ({ ink, room, sky }) => (
    <g>
      <rect x="20" y="20" width="360" height="240" fill="none" stroke={ink} strokeWidth="5" />
      <g fill="none" stroke={ink} strokeWidth="2.5">
        <path d="M190 20 V150" />
        <path d="M190 110 H330" />
        <path d="M370 110 H380" />
        <path d="M280 110 V118" />
        <path d="M280 144 V150" />
        <path d="M20 150 H70" />
        <path d="M110 150 H300" />
        <path d="M340 150 H380" />
        <path d="M250 150 V180" />
        <path d="M250 230 V260" />
      </g>
      <g fill="none" stroke={ink} strokeWidth="1">
        <path d="M70 150 V110 A40 40 0 0 1 110 150" />
        <path d="M370 110 V150 A40 40 0 0 1 330 110" />
        <path d="M280 144 H306 A26 26 0 0 0 280 118" />
        <rect x="36" y="36" width="70" height="86" />
        <rect x="296" y="28" width="70" height="74" />
        <rect x="198" y="116" width="34" height="28" rx="8" />
        <rect x="40" y="218" width="104" height="30" />
        <circle cx="200" cy="205" r="20" />
        <rect x="258" y="158" width="114" height="16" />
        <rect x="354" y="174" width="18" height="80" />
      </g>
      <g fill={room} stroke="none">
        <rect x="23" y="153" width="226" height="104" />
      </g>
      <g fill={sky} stroke={ink} strokeWidth="1">
        <rect x="60" y="15" width="90" height="10" />
        <rect x="236" y="15" width="100" height="10" />
        <rect x="60" y="255" width="140" height="10" />
      </g>
      <g fontSize="11" letterSpacing="0.5" fill={ink}>
        <text x="114" y="100">
          BED 1
        </text>
        <text x="204" y="50">
          BED 2
        </text>
        <text x="40" y="176">
          LIVING
        </text>
        <text x="264" y="200">
          KITCHEN
        </text>
      </g>
    </g>
  ),
  ps: ({ ink, room, sky }) => (
    <g>
      <rect x="20" y="20" width="360" height="240" fill="none" stroke={ink} strokeWidth="5" />
      <g fill="none" stroke={ink} strokeWidth="2.5">
        <path d="M280 20 V80" />
        <path d="M280 108 V110 H380" />
      </g>
      <g fill={room} stroke="none">
        <rect x="23" y="23" width="255" height="234" />
        <rect x="278" y="113" width="99" height="144" />
      </g>
      <g fill="none" stroke={ink} strokeWidth="1">
        <path d="M280 108 H252 A28 28 0 0 1 280 80" />
        <path d="M300 260 V224 A36 36 0 0 1 336 260" />
        <rect x="40" y="40" width="90" height="110" />
        <rect x="46" y="46" width="36" height="14" />
        <rect x="88" y="46" width="36" height="14" />
        <rect x="150" y="30" width="100" height="20" />
        <circle cx="205" cy="140" r="18" />
        <rect x="40" y="200" width="110" height="36" />
        <rect x="160" y="236" width="110" height="18" />
        <rect x="290" y="30" width="80" height="32" rx="10" />
        <circle cx="360" cy="92" r="8" />
      </g>
      <g fill={sky} stroke={ink} strokeWidth="1">
        <rect x="60" y="15" width="70" height="10" />
        <rect x="170" y="15" width="80" height="10" />
        <rect x="15" y="160" width="10" height="70" />
        <rect x="296" y="256" width="44" height="8" stroke="none" />
      </g>
      <g fontSize="11" letterSpacing="0.5" fill={ink}>
        <text x="160" y="190">
          STUDIO
        </text>
        <text x="160" y="203" fill={ink}>
          21′ × 15′
        </text>
        <text x="292" y="98">
          BATH
        </text>
      </g>
    </g>
  ),
  p1: ({ ink, room, sky }) => (
    <g>
      <rect x="20" y="20" width="360" height="240" fill="none" stroke={ink} strokeWidth="5" />
      <g fill={room} stroke="none">
        <rect x="193" y="23" width="184" height="234" />
      </g>
      <g fill="none" stroke={ink} strokeWidth="2.5">
        <path d="M190 20 V180" />
        <path d="M190 240 V260" />
        <path d="M20 150 H120" />
        <path d="M160 150 H190" />
        <path d="M110 150 V190" />
        <path d="M110 230 V260" />
      </g>
      <g fill="none" stroke={ink} strokeWidth="1">
        <path d="M160 150 V110 A40 40 0 0 0 120 150" />
        <path d="M110 230 H150 A40 40 0 0 0 110 190" />
        <rect x="40" y="36" width="90" height="74" />
        <rect x="46" y="42" width="36" height="13" />
        <rect x="88" y="42" width="36" height="13" />
        <rect x="30" y="196" width="30" height="54" rx="10" />
        <circle cx="90" cy="168" r="8" />
        <rect x="220" y="204" width="110" height="34" />
        <rect x="245" y="162" width="60" height="22" />
        <rect x="340" y="30" width="30" height="110" />
        <circle cx="260" cy="72" r="20" />
      </g>
      <g fill={sky} stroke={ink} strokeWidth="1">
        <rect x="50" y="15" width="80" height="10" />
        <rect x="220" y="15" width="90" height="10" />
        <rect x="375" y="170" width="10" height="70" />
      </g>
      <g fontSize="11" letterSpacing="0.5" fill={ink}>
        <text x="40" y="136">
          BEDROOM
        </text>
        <text x="30" y="186">
          BATH
        </text>
        <text x="208" y="130">
          LIVING · KITCHEN
        </text>
        <text x="208" y="143" fill={ink}>
          19′ × 15′
        </text>
      </g>
    </g>
  ),
  pv: ({ ink, room, sky }) => (
    <g>
      <rect x="20" y="20" width="360" height="240" fill="none" stroke={ink} strokeWidth="5" />
      <g fill={room} stroke="none">
        <rect x="23" y="163" width="214" height="94" />
      </g>
      <g fill="none" stroke={ink} strokeWidth="2.5">
        <path d="M150 20 V130" />
        <path d="M270 20 V130" />
        <path d="M20 130 H50" />
        <path d="M90 130 H180" />
        <path d="M220 130 H300" />
        <path d="M340 130 H380" />
        <path d="M240 160 V190" />
        <path d="M240 240 V260" />
        <path d="M240 160 H290" />
        <path d="M330 160 H380" />
      </g>
      <g fill="none" stroke={ink} strokeWidth="1">
        <path d="M50 130 V90 A40 40 0 0 1 90 130" />
        <path d="M180 130 V90 A40 40 0 0 1 220 130" />
        <path d="M300 130 V90 A40 40 0 0 1 340 130" />
        <rect x="80" y="34" width="60" height="46" />
        <rect x="205" y="34" width="58" height="46" />
        <rect x="315" y="34" width="58" height="46" />
        <rect x="40" y="216" width="120" height="32" />
        <rect x="70" y="180" width="60" height="22" />
        <rect x="250" y="236" width="120" height="18" />
        <rect x="280" y="190" width="60" height="22" />
      </g>
      <g fill={sky} stroke={ink} strokeWidth="1">
        <rect x="40" y="15" width="70" height="10" />
        <rect x="170" y="15" width="70" height="10" />
        <rect x="290" y="15" width="70" height="10" />
        <rect x="60" y="255" width="140" height="10" />
        <rect x="16" y="132" width="8" height="26" stroke="none" />
      </g>
      <g fontSize="11" letterSpacing="0.5" fill={ink}>
        <text x="28" y="52">
          BED 1
        </text>
        <text x="158" y="52">
          BED 2
        </text>
        <text x="278" y="52">
          BED 3
        </text>
        <text x="150" y="182">
          LIVING
        </text>
        <text x="252" y="182">
          KITCHEN
        </text>
      </g>
    </g>
  ),
};

export function FloorPlan({ plan, title, ink, room, sky }) {
  return (
    <svg
      viewBox="0 0 400 280"
      style={{ width: '100%', height: 'auto', display: 'block' }}
      role="img"
      aria-label={`Floor plan of ${title}`}
    >
      {plans[plan]({ ink, room, sky })}
    </svg>
  );
}
