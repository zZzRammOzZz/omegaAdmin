export function AreaChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 640;
  const h = 168;
  const padX = 8;
  const padY = 12;
  const coords = data.map((d, i) => {
    const x = padX + (i / Math.max(1, data.length - 1)) * (w - padX * 2);
    const y = h - padY - (d.value / max) * (h - padY * 2);
    return { x, y, ...d };
  });
  const line = coords.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${padX},${h - padY} ${line} ${w - padX},${h - padY}`;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9a05a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#c9a05a" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#areaGold)" />
        <polyline points={line} fill="none" stroke="#c9a05a" strokeWidth="2.5" strokeLinejoin="round" />
        {coords.filter((p) => p.value > 0).map((p) => (
          <circle key={p.label} cx={p.x} cy={p.y} r="3" fill="#161410" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-muted">
        {data.map((d, i) => (
          <span key={d.label} className={i % 2 === 1 ? "hidden sm:inline" : ""}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Donut({
  slices,
}: {
  slices: { label: string; value: number; color: string }[];
}) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const r = 42;
  const c = 2 * Math.PI * r;
  const arcs = slices.map((s, i) => {
    const len = total ? (s.value / total) * c : 0;
    const offset = slices.slice(0, i).reduce((sum, x) => sum + (total ? (x.value / total) * c : 0), 0);
    return { ...s, len, offset };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 120 120" className="h-32 w-32 shrink-0">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f3eee4" strokeWidth="16" />
        {total === 0 ? null : (
          <g transform="rotate(-90 60 60)">
            {arcs.map((s) => (
              <circle
                key={s.label}
                cx="60"
                cy="60"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="16"
                strokeDasharray={`${s.len} ${c - s.len}`}
                strokeDashoffset={-s.offset}
              />
            ))}
          </g>
        )}
        <text x="60" y="58" textAnchor="middle" className="fill-ink" fontSize="18" fontWeight="700">
          {total}
        </text>
        <text x="60" y="74" textAnchor="middle" className="fill-[#7a7266]" fontSize="8">
          visits
        </text>
      </svg>
      <ul className="min-w-0 flex-1 space-y-2 text-sm">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-muted">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="font-semibold">
              {s.value}
              {total ? <span className="ml-1 font-normal text-muted">{Math.round((s.value / total) * 100)}%</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BarRow({
  data,
}: {
  data: { label: string; value: number; color?: string }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium">{d.label}</span>
            <span className="text-muted">{d.value}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#f3eee4]">
            <div
              className="h-full rounded-full"
              style={{ width: `${(d.value / max) * 100}%`, background: d.color ?? "#c9a05a" }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function WeekBars({
  data,
}: {
  data: { label: string; value: number; highlight?: boolean }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center justify-end">
          <span className="mb-1 text-[11px] text-muted">{d.value || ""}</span>
          <div
            className={`w-full max-w-8 rounded-t-md ${d.highlight ? "bg-dark" : "bg-gold"}`}
            style={{ height: `${Math.max(6, (d.value / max) * 120)}px`, opacity: d.value === 0 ? 0.25 : 1 }}
          />
          <span className={`mt-2 text-[11px] ${d.highlight ? "font-semibold text-ink" : "text-muted"}`}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}
