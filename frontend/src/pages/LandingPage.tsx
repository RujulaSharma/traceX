import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/tracex-landing.css';

gsap.registerPlugin(ScrollTrigger);

export const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const $ = (s: string, r: Element | Document = root): HTMLElement | null =>
      r.querySelector(s);
    const $$ = (s: string, r: Element | Document = root): HTMLElement[] =>
      Array.from(r.querySelectorAll(s));
    const C = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
    const R = (i: number, a = 0.07, l = 0.25) =>
      `${(i * a).toFixed(2)},${(i * a + l).toFixed(2)}`;

    const H = [
      'Every intrusion leaves a signal.',
      'Detect the activity that deserves attention.',
      'Connect events that tell the same story.',
      'Reconstruct how the intrusion unfolded.',
      'Turn fragmented evidence into an understandable investigation.',
    ];
    const NM = ['signal', 'detection', 'connection', 'reconstruction', 'evidence'];
    const SN = [
      'THE SIGNAL',
      'THE DETECTION',
      'THE CONNECTION',
      'THE RECONSTRUCTION',
      'THE EVIDENCE',
    ];

    const LG: [string, string, string, number, number, number, string?][] = [
      ['02:14:07.112', 'auth.fail', 'a.reyes 185.220.101.47', 4, 20, 40],
      ['02:14:07.381', 'auth.fail', 'j.lindqvist 185.220.101.47', 40, 56, -50],
      ['02:18:44.020', 'dns.query', 'WS-DEV-031 10.20.6.11', 8, 104, 60],
      ['02:33:10.551', 'vpn.connect', 'r.chen 91.204.18.3', 44, 146, -40],
      ['02:31:52.904', 'auth.success', 'm.okafor 185.220.101.47', 14, 208, 0, 'h'],
      ['02:38:10.207', 'proc.create', 'WS-FIN-022 powershell.exe -enc', 3, 272, 50],
      ['02:41:03.778', 'auth.fail', 'svc-backup 45.137.21.9', 42, 314, -60],
      ['02:44:19.330', 'file.read', 'FS-ARCHIVE \\payroll', 8, 352, 40],
      ['02:52:44.102', 'proc.access', 'lsass.exe WS-FIN-022', 48, 360, -30],
    ];

    const DT = [
      ['Impossible travel sign-in', 'DET-4821 · m.okafor · 185.220.101.47', 'CRITICAL'],
      ['Brute-force burst (412 attempts)', 'DET-4819 · svc-backup · 45.137.21.9', 'HIGH'],
      ['Encoded PowerShell execution', 'DET-4816 · WS-FIN-022 · powershell.exe', 'CRITICAL'],
      ['New admin group membership', 'DET-4810 · j.lindqvist · DC-01', 'HIGH'],
    ];

    const BH = [12, 16, 10, 22, 18, 30, 26, 36, 58, 100, 84, 40, 26, 20];
    const ND: [string, string, number, number, number?][] = [
      ['185.220.101.47', 'EXTERNAL IP', 110, 190],
      ['auth.success', 'EVENT', 250, 80],
      ['m.okafor', 'USER', 330, 300, 1],
      ['WS-FIN-022', 'HOST', 470, 190],
      ['powershell.exe', 'PROCESS', 570, 80],
      ['FS-ARCHIVE', 'RESOURCE', 600, 300],
    ];
    const ED = [
      [0, 1],
      [0, 2],
      [1, 2],
      [2, 3],
      [3, 4],
      [3, 5],
      [4, 5],
    ];

    const TL = [
      [
        '02:14:07',
        'INITIAL ACCESS',
        'Password spray against portal',
        '412 failed attempts from a single external address across 38 accounts.',
      ],
      [
        '02:31:52',
        'VALID ACCOUNT',
        'Successful sign-in for m.okafor',
        'Login from new geography 11 minutes after a domestic session.',
      ],
      [
        '02:38:10',
        'EXECUTION',
        'Encoded PowerShell on WS-FIN-022',
        'Base64 command spawned from explorer.exe under the compromised user.',
      ],
      [
        '02:52:44',
        'CREDENTIAL ACCESS',
        'LSASS memory read',
        'Process handle requested on lsass.exe with read privileges.',
      ],
      [
        '03:09:31',
        'LATERAL MOVEMENT',
        'SMB session to FS-ARCHIVE',
        'Admin share accessed using harvested service credentials.',
      ],
      [
        '03:26:05',
        'EXFILTRATION',
        '4.2 GB outbound transfer',
        'Compressed archive transferred to an external endpoint over HTTPS.',
      ],
    ];

    const EV = [
      [
        'auth_logs_0214.ndjson',
        'EV-01 · evt_7f3a92c1',
        '4,812 failed attempts, then one successful sign-in from 185.220.101.47.',
      ],
      [
        'Process tree · WS-FIN-022',
        'EV-02 · evt_80b1e4d2',
        'explorer.exe to powershell.exe -enc with a 2.1 KB base64 payload.',
      ],
      [
        'LSASS handle request',
        'EV-03 · evt_84c7a310',
        'Read access to lsass.exe from the PowerShell process.',
      ],
      [
        'Egress flow summary',
        'EV-04 · evt_91fe22a8',
        '4.2 GB sent to an external endpoint over HTTPS.',
      ],
    ];

    const NAR =
      'A password spray led to a valid sign-in for m.okafor, followed by encoded PowerShell on WS-FIN-022, credential access, lateral movement to FS-ARCHIVE and a 4.2 GB outbound transfer.';

    const P = [
      `<div class="cnt mono">EVENTS INGESTED<b data-s="0,.8" data-n="412118">0</b></div>${LG.map(
        (l, i) =>
          `<div class="lg${l[6] ? ' h' : ''}" data-s="${R(i)}" style="left:${l[3]}%;top:${l[4]}px;--d:${l[5]}"><span>${l[0]}</span> <b>${l[1]}</b> ${l[2]}</div>`
      ).join('')}`,
      `<div class="hrow">Suspicious authentication activity<em>last 24h</em></div><div class="st">${[
        ['EVENTS', 2.41, 2, 'M'],
        ['DETECTIONS', 7, 0, ''],
        ['FAILED AUTH', 1284, 0, ''],
        ['CRITICAL', 2, 0, ''],
      ]
        .map(
          (s, i) =>
            `<div class="${i === 3 ? 'cr' : ''}"><small>${s[0]}</small><b data-s="0,.3" data-n="${s[1]}" data-d="${s[2]}" data-u="${s[3]}">0</b></div>`
        )
        .join('')}</div><div class="g2"><div>${DT.map(
        (d, i) =>
          `<div class="dr" data-s="${(0.2 + i * 0.13).toFixed(2)},${(0.42 + i * 0.13).toFixed(2)}"><div><b>${d[0]}</b><small>${d[1]}</small></div><span class="tg${d[2] === 'CRITICAL' ? ' c' : ''}">${d[2]}</span></div>`
      ).join('')}</div><div class="cx"><small>FAILED LOGINS / 15M</small><div class="bars">${BH.map(
        (h, i) =>
          `<i class="${i === 9 || i === 10 ? 'x' : ''}" data-s="${R(i, 0.03, 0.3).replace(/^/, '')}" style="--h:${h}"></i>`
      ).join('')}</div><em>Spike at 02:14 UTC · +540%</em></div></div>`,
      `<svg viewBox="0 0 680 402">${ED.map(
        (e, j) =>
          `<line data-s="${(0.3 + j * 0.08).toFixed(2)},${(0.5 + j * 0.08).toFixed(2)}" pathLength="1" x1="${ND[e[0]][2]}" y1="${ND[e[0]][3]}" x2="${ND[e[1]][2]}" y2="${ND[e[1]][3]}"/>`
      ).join('')}${ND.map(
        (n, i) =>
          `<g class="nd" data-s="${R(i, 0.08, 0.2)}"><circle cx="${n[2]}" cy="${n[3]}" r="19" fill="#101113" stroke="${n[4] ? '#E7A1B5' : '#3DFF86'}" stroke-width="1.5"/><circle cx="${n[2]}" cy="${n[3]}" r="4" fill="${n[4] ? '#E7A1B5' : '#3DFF86'}"/><text x="${n[2]}" y="${n[3] + 36}" text-anchor="middle">${n[0]}</text><text class="t" x="${n[2]}" y="${n[3] + 48}" text-anchor="middle">${n[1]}</text></g>`
      ).join('')}</svg><div class="pill" data-s=".85,1">6 entities · 7 relationships · 1 shared narrative</div>`,
      `<small>RECONSTRUCTED TIMELINE</small><div class="hrow" style="margin-top:4px">INC-2041 · Operation Glass Ledger<em>71m 58s span</em></div><div class="rl"><i data-s="0,.85"></i>${TL.map(
        (_, i) =>
          `<u class="${i === 5 ? 'x' : ''}" style="left:${i * 16.66}%" data-s="${R(i, 0.15, 0.1)}"></u>`
      ).join('')}</div><div class="tl">${TL.map(
        (t, i) =>
          `<div class="${i === 5 ? 'x' : ''}" data-s="${R(i, 0.15, 0.2)}"><em>${t[0]}</em><small>${t[1]}</small><b>${t[2]}</b><p>${t[3]}</p></div>`
      ).join('')}</div>`,
      `<div class="hrow"><span class="bg2">CRITICAL</span>Operation Glass Ledger</div><div class="mono" style="color:var(--n);font-size:11px;margin:6px 0 12px">14 entities · 1,287 events · 6 techniques</div><div class="g2"><div><small style="margin-bottom:8px">EVIDENCE</small>${EV.map(
        (e, i) =>
          `<div class="ev"><b>${e[0]}</b><small>${e[1]}</small><div class="dd" data-s="${(0.1 + i * 0.15).toFixed(2)},${(0.3 + i * 0.15).toFixed(2)}">${e[2]}</div></div>`
      ).join('')}</div><div><small>INCIDENT NARRATIVE</small><div class="nar" data-s=".35,.9" data-t="${NAR}"></div><div class="cps">${[
        'T1110',
        'T1078',
        'T1059.001',
        'T1003.001',
        'T1021.002',
        'T1567',
      ]
        .map(
          (t, i) =>
            `<span data-s="${(0.6 + i * 0.06).toFixed(2)},${(0.7 + i * 0.06).toFixed(2)}">${t}</span>`
        )
        .join('')}</div></div></div>`,
    ];

    const bd = $('#bd');
    if (bd) bd.innerHTML = P.map((p) => `<div class="pn">${p}</div>`).join('');
    const hd = $('#hd');
    if (hd) hd.innerHTML = H.map((h) => `<h2>${h}</h2>`).join('');
    const steps = $('#steps');
    if (steps)
      steps.innerHTML = SN.map((s, i) => `<li data-i="${i}"><b>0${i + 1}</b>${s}</li>`).join(
        ''
      );

    const CP = [
      [
        'Security Log Ingestion',
        'Bring fragmented security telemetry into one investigation workflow.',
        [
          'CSV, JSON and NDJSON sources',
          'Normalized into a shared event schema',
          'Ingestion history with event counts',
        ],
      ],
      [
        'Threat Detection',
        'Surface suspicious activity and highlight the findings that need attention.',
        [
          'Severity-ranked findings',
          'Suspicious authentication patterns',
          'Technique context on every detection',
        ],
      ],
      [
        'Cross-Event Correlation',
        'Connect related activity across users, hosts, network indicators, and time.',
        [
          'Entity-level linking',
          'Time-window clustering',
          'One cluster per probable intrusion',
        ],
      ],
      [
        'Attack Reconstruction',
        'Understand the sequence of events and the relationships between entities.',
        [
          'Chronological stage ordering',
          'Graph and timeline stay in sync',
          'Hover a stage to trace the path',
        ],
      ],
      [
        'Evidence and Explainability',
        'Make investigations easier to understand, review, and communicate.',
        [
          'Every claim references an event',
          'MITRE ATT&CK technique labels',
          'A plain-language incident summary',
        ],
      ],
    ];

    const rows = $('#rows');
    if (rows)
      rows.innerHTML = CP.map(
        (c, i) =>
          `<div class="row"><div class="tx"><div class="num">0${i + 1}</div><h3>${c[0]}</h3><p>${c[1]}</p><ul>${(c[2] as string[]).map((b) => `<li>${b}</li>`).join('')}</ul></div><div class="win cl"><div class="tb"><i></i><i></i><i></i><span>tracex://${NM[i]}</span><em class="demo">● DEMO DATA</em></div><div class="bd"><div class="pn">${P[i]}</div></div></div></div>`
      ).join('');

    // Animation Unit Parsing
    interface UnitEntry {
      e: HTMLElement;
      r: number[];
      n: string | undefined;
      t: string | undefined;
      k: number;
    }
    interface Unit {
      el: HTMLElement;
      els: UnitEntry[];
    }

    const stageUnits: Unit[] = [];
    $$('#bd>.pn').forEach((el) => {
      const els: UnitEntry[] = $$('[data-s]', el).map((e) => ({
        e,
        r: (e.dataset.s || '0,1').split(',').map(Number),
        n: e.dataset.n,
        t: e.dataset.t,
        k: -1,
      }));
      stageUnits.push({ el, els });
    });

    const rowUnits: Unit[] = [];
    $$('.cl .pn').forEach((el) => {
      const els: UnitEntry[] = $$('[data-s]', el).map((e) => ({
        e,
        r: (e.dataset.s || '0,1').split(',').map(Number),
        n: e.dataset.n,
        t: e.dataset.t,
        k: -1,
      }));
      rowUnits.push({ el, els });
    });

    function paint(u: Unit, sp: number) {
      u.el.style.setProperty('--sp', String(sp));
      for (const o of u.els) {
        const k = C((sp - o.r[0]) / (o.r[1] - o.r[0]));
        if (k === o.k) continue;
        o.k = k;
        o.e.style.setProperty('--k', String(k));
        if (o.n != null) {
          const v = Number(o.n) * k;
          const d = +(o.e.dataset.d || 0);
          o.e.textContent =
            (d ? v.toFixed(d) : Math.round(v).toLocaleString('en-US')) +
            (o.e.dataset.u || '');
        }
        if (o.t) {
          o.e.textContent = o.t.slice(0, Math.round(o.t.length * k));
        }
      }
    }

    // Text splitting for kinetic typography
    const SWD: HTMLElement[] = [];
    function split(h: Element, cls: string, out?: HTMLElement[]) {
      let i = 0;
      const f = (n: Node) => {
        [...n.childNodes].forEach((c) => {
          if (c.nodeType === 3) {
            const fr = document.createDocumentFragment();
            (c.textContent || '').split(/(\s+)/).forEach((t) => {
              if (!t.trim()) {
                fr.append(t);
              } else {
                const e = document.createElement('i');
                e.className = cls;
                e.textContent = t;
                e.style.setProperty('--w', String(i++));
                fr.append(e);
                if (out) out.push(e);
              }
            });
            c.replaceWith(fr);
          } else {
            f(c);
          }
        });
      };
      f(h);
    }

    const stP = $('#st p');
    if (stP) split(stP, 'wd', SWD);
    $$('#hd h2,#caps h2,#pricing h2,#end h2').forEach((h) => {
      split(h, 'w');
      h.classList.add('wr');
    });

    // Stage switching helper
    let act = -1;
    function setStage(i: number) {
      if (i === act) return;
      act = i;
      $$('#bd>.pn').forEach((e, j) => {
        const isActive = j === i;
        e.classList.toggle('on', isActive);
        e.style.opacity = isActive ? '1' : '0';
        e.style.pointerEvents = isActive ? 'auto' : 'none';
      });
      $$('#hd h2').forEach((e, j) => {
        const isActive = j === i;
        e.classList.toggle('on', isActive);
        e.style.opacity = isActive ? '1' : '0';
        e.style.transform = isActive ? 'translateY(0)' : 'translateY(16px)';
        e.style.pointerEvents = isActive ? 'auto' : 'none';
      });
      $$('#steps li').forEach((e, j) => {
        e.classList.toggle('on', j === i);
        e.classList.toggle('d', j < i);
      });
      const url = $('#url');
      if (url) url.innerHTML = 'tracex://investigation/<b>' + NM[i] + '</b>';
      const ct = $('#ct');
      if (ct) ct.textContent = '0' + (i + 1) + '/05';
    }

    // Set initial stage
    setStage(0);
    if (stageUnits[0]) paint(stageUnits[0], 0);

    // Pointer parallax on Hero
    const hero = $('#hero');
    const handlePointerMove = (e: PointerEvent) => {
      if (!hero) return;
      hero.style.setProperty('--mx', String(e.clientX / window.innerWidth - 0.5));
      hero.style.setProperty('--my', String(e.clientY / window.innerHeight - 0.5));
    };
    window.addEventListener('pointermove', handlePointerMove);

    // Pricing Billing Period Toggle
    $$('.bt button').forEach((b) => {
      b.onclick = () => {
        $$('.bt button').forEach((x) => x.classList.toggle('on', x === b));
        const y = b.dataset.b === 'y';
        $$('.amt').forEach((a) => {
          a.textContent = (y ? a.dataset.y : a.dataset.m) || '';
        });
        $$('.pc .nt').forEach((n) => {
          n.textContent = (y ? n.dataset.y : n.dataset.m) || '';
        });
      };
    });

    // Step navigation click
    $$('#steps li').forEach((li) => {
      li.onclick = () => {
        const stageIdx = Number(li.dataset.i || 0);
        const st = ScrollTrigger.getById('seq-trigger');
        if (st) {
          const targetScroll = st.start + (stageIdx * 0.2 + 0.08) * (st.end - st.start);
          window.scrollTo({
            top: targetScroll,
            behavior: 'smooth',
          });
        }
      };
    });

    // Skip Sequence click
    const skipBtn = $('#skip-seq');
    if (skipBtn) {
      skipBtn.onclick = (e) => {
        e.preventDefault();
        const st = ScrollTrigger.getById('seq-trigger');
        if (st) {
          window.scrollTo({
            top: st.end + 50,
            behavior: 'smooth',
          });
        } else {
          const caps = $('#caps');
          if (caps) caps.scrollIntoView({ behavior: 'smooth' });
        }
      };
    }

    // GSAP ScrollTrigger Orchestration
    const ctx = gsap.context(() => {
      // 1. HERO PARALLAX & RETICLE SCANNERS
      const rt = $('#rt');
      const sw = $('#sw');
      if (hero) {
        ScrollTrigger.create({
          id: 'hero-trigger',
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
          onUpdate: (self) => {
            const h = self.progress;
            hero.style.setProperty('--hp', String(h));
            if (rt) {
              rt.style.setProperty('--a', String(C((h - 0.1) / 0.35)));
              rt.style.setProperty(
                '--b',
                String(C((h - 0.4) / 0.15) * (1 - C((h - 0.8) / 0.15)))
              );
            }
            if (sw) {
              sw.style.opacity = h > 0.04 && h < 0.95 ? '0.85' : '0';
            }
          },
        });
      }

      // 2. INVESTIGATION SEQUENCE (PINNED 5-STAGE ENGINE)
      const seq = $('#seq');
      const stepsEl = $('#steps');
      const winEl = $('#sk .win');
      if (seq) {
        ScrollTrigger.create({
          id: 'seq-trigger',
          trigger: seq,
          start: 'top top',
          end: () => `+=${window.innerWidth <= 860 ? 2200 : 3200}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress; // 0.0 to 1.0
            const currentStage = Math.min(4, Math.floor(p * 5));
            setStage(currentStage);

            if (stepsEl) stepsEl.style.setProperty('--p', String(p));

            // Stage sub-progress (clamped and held at end)
            const stageStart = currentStage * 0.2;
            const stageRaw = (p - stageStart) / 0.2;
            const localProgress = Math.min(1, Math.max(0, stageRaw / 0.85));

            // Bidirectional paint of all stages to prevent desync
            for (let s = 0; s < 5; s++) {
              if (stageUnits[s]) {
                if (s < currentStage) {
                  paint(stageUnits[s], 1);
                } else if (s > currentStage) {
                  paint(stageUnits[s], 0);
                } else {
                  paint(stageUnits[s], localProgress);
                }
              }
            }

            if (winEl) {
              winEl.style.setProperty('--p2', String(p));
            }
          },
        });
      }

      // 3. KINETIC TYPOGRAPHY & STATS COUNTERS (#st)
      const st = $('#st');
      const sns = $$('.sn');
      if (st) {
        ScrollTrigger.create({
          id: 'st-trigger',
          trigger: st,
          start: 'top top',
          end: () => `+=${window.innerWidth <= 860 ? 900 : 1400}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: (self) => {
            const q3 = self.progress; // 0.0 to 1.0
            SWD.forEach((w: any, j) => {
              const k = C(q3 * 1.3 * (SWD.length + 4) - j);
              if (k !== w._k) {
                w._k = k;
                w.style.setProperty('--k', String(k));
              }
            });

            // Reveal stats in the second half of the scrub
            const q = C((q3 - 0.55) / 0.38);
            st.style.setProperty('--q', String(q));
            sns.forEach((n) => {
              const num = Number(n.dataset.n || 0) * q;
              const d = +(n.dataset.d || 0);
              n.textContent =
                (d ? num.toFixed(d) : Math.round(num).toString()) + (n.dataset.u || '');
            });
          },
        });
      }

      // 4. CAPABILITY DEMONSTRATION ROWS (#caps)
      $$('.row').forEach((row, i) => {
        const tx = row.querySelector('.tx') as HTMLElement | null;
        const win = row.querySelector('.win.cl') as HTMLElement | null;
        const pn = row.querySelector('.cl .pn') as HTMLElement | null;
        const unit = rowUnits[i];

        if (tx) {
          gsap.fromTo(
            tx,
            { opacity: 0, y: 35, filter: 'blur(8px)' },
            {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: row,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }

        if (win && pn && unit) {
          ScrollTrigger.create({
            trigger: row,
            start: 'top 85%',
            end: 'bottom 40%',
            scrub: 0.5,
            onUpdate: (self) => {
              const s = self.progress;
              win.style.setProperty('--rv', String(C(s * 1.8)));
              paint(unit, s);
            },
          });
        }
      });

      // 5. PRICING CARDS STAGGERED ENTRANCE
      const pc = $$('.pc');
      if (pc.length > 0) {
        gsap.fromTo(
          pc,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#pricing',
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // 6. CLOSING CTA ENTRANCE
      const endActs = $('#end .acts');
      if (endActs) {
        gsap.fromTo(
          endActs,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#end',
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, containerRef);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="tracex-landing bg-[#08090A] text-[#F4F2F3] font-sans selection:bg-[#3DFF86] selection:text-[#08090A] overflow-x-clip min-h-screen"
    >
      {/* Top Navigation */}
      <nav>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <b>
            Trace<i>X</i>
          </b>
        </Link>
        <div className="m">
          <a href="#seq">Platform</a>
          <a href="#caps">Capabilities</a>
          <a href="#seq">Investigation</a>
          <a href="#pricing">Pricing</a>
          <button
            type="button"
            className="btn"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/soc')}
          >
            Launch Platform
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero">
        <div id="hs">
          <div id="fg">
            <div id="fgi">
              <div className="ph" />
              <div className="gl g1" />
              <div className="gl g2" />
              <svg id="rt" viewBox="0 0 1672 941" aria-hidden="true">
                <circle className="d" pathLength={1} cx="1185" cy="385" r="190" />
                <circle className="sp" cx="1185" cy="385" r="228" />
                <path
                  className="d"
                  pathLength={1}
                  d="M940 190V130H1000M1370 130H1430V190M1430 600V660H1370M1000 660H940V600"
                />
                <path className="l" d="M935 385H985M1385 385H1435M1185 120V170M1185 600V650" />
                <text x="780" y="705">
                  TARGET LOCKED
                </text>
                <text className="r" x="780" y="732">
                  HOLLOW-07 · UNATTRIBUTED
                </text>
                <text x="780" y="759">
                  FACE NOT AVAILABLE
                </text>
                <text x="780" y="786">
                  FIRST SEEN 02:31:52 UTC
                </text>
              </svg>
              <i id="sw" />
            </div>
          </div>
          <span className="ch" style={{ right: '9vw', top: '24vh' }}>
            <b>›</b> 185.220.101.47 → 10.20.4.18
          </span>
          <span className="ch r" style={{ right: '5vw', top: '62vh', animationDelay: '-3s' }}>
            <b>›</b> proc.create powershell.exe -enc
          </span>
          <span className="ch" style={{ right: '34vw', top: '80vh', animationDelay: '-5s' }}>
            <b>T1078</b> valid accounts
          </span>
          <div className="tag">AUTONOMOUS INVESTIGATION · ATTACK RECONSTRUCTION</div>
          <h1>
            Find the
            <br />
            intruder.
            <br />
            Reconstruct
            <br />
            <span>the story.</span>
          </h1>
          <p>
            TraceX transforms fragmented security telemetry into correlated attack narratives,
            giving security teams a clearer path from suspicious activity to actionable evidence.
          </p>
          <div className="cta">
            <a className="btn p" href="#seq">
              Explore the Platform
            </a>
            <button
              type="button"
              className="btn o"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/soc')}
            >
              Open SOC Console
            </button>
          </div>
          <div id="cue">SCROLL</div>
        </div>
      </section>

      {/* Sticky Interactive 5-Stage Sequence */}
      <section id="seq">
        <div id="sk">
          <ol id="steps" />
          <div id="hd" />
          <div className="win">
            <div className="tb">
              <i />
              <i />
              <i />
              <span id="url" />
              <em id="ct" />
            </div>
            <div className="bd" id="bd" />
          </div>
          <div id="hint">
            <span>SCROLL TO ADVANCE</span>
            <a href="#caps" id="skip-seq">
              SKIP SEQUENCE
            </a>
          </div>
        </div>
      </section>

      {/* Kinetic Typography and Animated Stats */}
      <section id="st">
        <div className="si">
          <p>
            Attackers hide in the <span className="r">noise.</span>{' '}
            <span className="g">TraceX</span> reads every log, connects every clue, and shows you{' '}
            <span className="g">exactly what happened</span>, in the order it happened.
          </p>
          <div id="sts">
            <div>
              <b className="sn" data-n="38">
                0
              </b>
              <small>log sources joined</small>
            </div>
            <div>
              <b className="sn" data-n="2.4" data-d="1" data-u="M">
                0
              </b>
              <small>events read per minute</small>
            </div>
            <div>
              <b className="sn" data-n="4" data-u=" min">
                0
              </b>
              <small>median time to a first narrative</small>
            </div>
          </div>
        </div>
      </section>

      {/* Capability Deep-Dives with Interactive Demonstration Windows */}
      <section id="caps">
        <h2>
          From raw telemetry to a <span>defensible</span> narrative.
        </h2>
        <p className="ld">
          Five connected stages, each designed to reduce the distance between an isolated alert
          and an investigation a team can review. Previews are interactive demonstrations with mock
          data.
        </p>
        <div id="rows" />
      </section>

      {/* Pricing Section with Monthly/Yearly Toggle */}
      <section id="pricing">
        <h2>
          Pick the depth of <span>investigation.</span>
        </h2>
        <p className="ld">
          Every plan includes timelines, attack graphs and MITRE ATT&amp;CK mapping. Pro adds
          autonomous investigations and evidence you can hand to an auditor. Prices are illustrative.
        </p>
        <div className="bt" role="group" aria-label="Billing period">
          <button className="on" data-b="m">
            Monthly
          </button>
          <button data-b="y">
            Yearly<em>save 20%</em>
          </button>
        </div>
        <div className="pg">
          <div className="pc" style={{ ['--i' as any]: 0 }}>
            <h3>Solo</h3>
            <p className="ds">For individual analysts getting started with attack reconstruction.</p>
            <div className="pr">
              <sup>$</sup>
              <b className="amt" data-m="29" data-y="23">
                29
              </b>
              <span>/ month</span>
            </div>
            <div className="nt" data-m="Billed monthly" data-y="Billed annually">
              Billed monthly
            </div>
            <button
              type="button"
              className="btn o"
              style={{ width: '100%', cursor: 'pointer' }}
              onClick={() => navigate('/soc')}
            >
              Start free trial
            </button>
            <ul>
              <li>
                <b>1</b> analyst seat
              </li>
              <li>5 GB/day log ingestion</li>
              <li>30-day retention</li>
              <li>Detections ranked by severity</li>
              <li>Attack timeline and graph</li>
              <li>MITRE ATT&amp;CK mapping</li>
            </ul>
          </div>
          <div className="pc hot" style={{ ['--i' as any]: 1 }}>
            <span className="pl">MOST POPULAR</span>
            <h3>Pro</h3>
            <p className="ds">
              For security teams who need autonomous investigations and evidence they can defend.
            </p>
            <div className="pr">
              <sup>$</sup>
              <b className="amt" data-m="99" data-y="79">
                99
              </b>
              <span>/ analyst / month</span>
            </div>
            <div className="nt" data-m="Most teams choose this" data-y="Billed annually">
              Most teams choose this
            </div>
            <button
              type="button"
              className="btn p"
              style={{ width: '100%', cursor: 'pointer' }}
              onClick={() => navigate('/soc')}
            >
              Join now
            </button>
            <ul>
              <li>
                <b>Up to 10</b> analyst seats
              </li>
              <li>100 GB/day log ingestion</li>
              <li>90-day retention</li>
              <li>Autonomous investigations</li>
              <li>Cross-event correlation across all sources</li>
              <li>Evidence chain and incident reports</li>
              <li>API access and webhooks</li>
              <li>Priority support, 4-hour response</li>
            </ul>
          </div>
          <div className="pc" style={{ ['--i' as any]: 2 }}>
            <h3>Enterprise</h3>
            <p className="ds">For SOCs with compliance, scale and deployment requirements.</p>
            <div className="pr">
              <sup>$</sup>
              <b className="amt" data-m="499" data-y="399">
                499
              </b>
              <span>/ month, starting at</span>
            </div>
            <div className="nt" data-m="Annual contract available" data-y="Billed annually">
              Annual contract available
            </div>
            <button
              type="button"
              className="btn o"
              style={{ width: '100%', cursor: 'pointer' }}
              onClick={() => navigate('/soc')}
            >
              Talk to sales
            </button>
            <ul>
              <li>
                <b>Unlimited</b> analyst seats
              </li>
              <li>1 TB/day log ingestion</li>
              <li>1-year retention</li>
              <li>SSO / SAML and role-based access</li>
              <li>Full audit logs</li>
              <li>VPC or on-premise deployment</li>
              <li>Dedicated solutions engineer</li>
              <li>99.9% uptime SLA</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section id="end">
        <h2>
          Read the breach <span>back.</span>
        </h2>
        <p>
          See an attack rebuilt from scattered logs into one sequence you can verify. Start free, or
          poke around the live demo first.
        </p>
        <div className="acts">
          <button
            type="button"
            className="btn p"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/soc')}
          >
            Launch Console
          </button>
          <button
            type="button"
            className="btn o"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/ingestion')}
          >
            Ingest Logs
          </button>
          <a className="btn rr" href="#seq">
            Try the live demo
          </a>
        </div>
        <span className="nt">14-day trial · No credit card · Demo data only</span>
      </section>

      {/* Footer */}
      <footer className="ft">
        <div className="fg">
          <div>
            <b>
              Trace<i>X</i>
            </b>
            <p>
              Autonomous security investigation and attack reconstruction. Fragmented telemetry in,
              defensible narrative out.
            </p>
            <span className="ok">
              <i />
              All systems operational
            </span>
          </div>
          <div>
            <h4>Platform</h4>
            <Link to="/ingestion">Log ingestion</Link>
            <Link to="/detections">Threat detection</Link>
            <Link to="/events">Correlation</Link>
            <Link to="/incidents">Attack reconstruction</Link>
            <Link to="/soc">SOC Overview</Link>
          </div>
          <div>
            <h4>Resources</h4>
            <a href="#seq">Live Sequence</a>
            <a href="#caps">Capabilities</a>
            <a href="#pricing">Pricing Plans</a>
            <Link to="/events">Event Explorer</Link>
            <Link to="/incidents">Incident Reports</Link>
          </div>
          <div>
            <h4>Company</h4>
            <a href="#end">About TraceX</a>
            <a href="#end">Security &amp; Trust</a>
            <a href="#end">Careers</a>
            <a href="#end">Contact</a>
            <a href="#pricing">Pricing</a>
          </div>
        </div>
        <div className="fb">
          <span>© 2026 TraceX. Autonomous Security Investigation &amp; Attack Reconstruction.</span>
          <span>Privacy · Terms · Status · SOC 2 Compliant</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
