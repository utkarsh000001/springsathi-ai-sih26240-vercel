import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  CloudRain,
  Droplets,
  FileText,
  Filter,
  Gauge,
  Leaf,
  MapPinned,
  Menu,
  Mountain,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sprout,
  Target,
  Tractor,
  TrendingUp,
  Users,
  Waves,
  X,
} from "lucide-react";

type View = "overview" | "springs" | "planner" | "fieldwork" | "monitoring";
type SpringStatus = "Priority" | "Watch" | "Stable";
type WorkStatus = "Planned" | "In progress" | "Complete";

type Spring = {
  id: string;
  name: string;
  village: string;
  district: string;
  flow: number;
  baseline: number;
  season: string;
  risk: string;
  potential: number;
  confidence: number;
  status: SpringStatus;
  rainfall: number;
  slope: number;
  permeability: string;
  community: number;
  lastSurvey: string;
};

type Intervention = {
  id: string;
  springId: string;
  title: string;
  village: string;
  type: string;
  owner: string;
  status: WorkStatus;
  due: string;
  impact: string;
};

const seedSprings: Spring[] = [
  { id: "SPR-014", name: "Munda Dhara", village: "Kharpani", district: "Simdega", flow: 18, baseline: 31, season: "Perennial", risk: "Recharge declining", potential: 86, confidence: 91, status: "Priority", rainfall: 78, slope: 22, permeability: "High", community: 4, lastSurvey: "12 Sep 2026" },
  { id: "SPR-021", name: "Banspahari Source", village: "Banspahari", district: "Gumla", flow: 11, baseline: 25, season: "Seasonal", risk: "Drying early", potential: 78, confidence: 84, status: "Priority", rainfall: 72, slope: 31, permeability: "Medium", community: 5, lastSurvey: "08 Sep 2026" },
  { id: "SPR-009", name: "Mahua Bend", village: "Kumhar Toli", district: "Khunti", flow: 24, baseline: 27, season: "Perennial", risk: "Stable", potential: 62, confidence: 77, status: "Watch", rainfall: 68, slope: 18, permeability: "Medium", community: 3, lastSurvey: "18 Sep 2026" },
  { id: "SPR-033", name: "Sal Ridge", village: "Salki", district: "West Singhbhum", flow: 7, baseline: 22, season: "Seasonal", risk: "Critical low flow", potential: 91, confidence: 88, status: "Priority", rainfall: 81, slope: 39, permeability: "High", community: 4, lastSurvey: "04 Sep 2026" },
  { id: "SPR-017", name: "Karam Nala", village: "Jaldega", district: "Simdega", flow: 29, baseline: 28, season: "Perennial", risk: "Stable", potential: 47, confidence: 72, status: "Stable", rainfall: 65, slope: 12, permeability: "Low", community: 2, lastSurvey: "20 Sep 2026" },
];

const seedWork: Intervention[] = [
  { id: "WRK-102", springId: "SPR-014", title: "Contour trench network", village: "Kharpani", type: "Recharge trench", owner: "Kharpani Gram Sabha", status: "In progress", due: "28 Sep 2026", impact: "+18% recharge potential" },
  { id: "WRK-098", springId: "SPR-033", title: "Loose boulder check dam", village: "Salki", type: "Check dam", owner: "Salki Water Committee", status: "Planned", due: "05 Oct 2026", impact: "Protects 3 recharge paths" },
  { id: "WRK-094", springId: "SPR-021", title: "Native vegetation buffer", village: "Banspahari", type: "Catchment restoration", owner: "Banspahari SHG cluster", status: "Complete", due: "21 Sep 2026", impact: "Stabilises upper slope" },
];

const navItems: { id: View; label: string; icon: typeof BarChart3; hint: string }[] = [
  { id: "overview", label: "Overview", icon: BarChart3, hint: "Regional water picture" },
  { id: "springs", label: "Spring registry", icon: Waves, hint: "Field observations" },
  { id: "planner", label: "Recharge planner", icon: Target, hint: "Prioritise interventions" },
  { id: "fieldwork", label: "Field work", icon: Tractor, hint: "Track implementation" },
  { id: "monitoring", label: "Monitoring", icon: Activity, hint: "Measure change" },
];

const fmtDate = () => "27 Sep 2026";

function scoreLabel(score: number) {
  if (score >= 80) return "High priority";
  if (score >= 60) return "Review soon";
  return "Monitor";
}

function StatusPill({ value }: { value: string }) {
  const lower = value.toLowerCase();
  const tone = lower.includes("priority") || lower.includes("critical") ? "pill-red" : lower.includes("watch") || lower.includes("declining") || lower.includes("progress") ? "pill-amber" : lower.includes("complete") || lower.includes("stable") ? "pill-green" : "pill-blue";
  return <span className={`status-pill ${tone}`}><span className="status-dot" />{value}</span>;
}

function Metric({ icon: Icon, label, value, detail, tone }: { icon: typeof Droplets; label: string; value: string; detail: string; tone: string }) {
  return <div className="metric-card">
    <div className={`metric-icon ${tone}`}><Icon size={18} /></div>
    <div><p className="metric-label">{label}</p><p className="metric-value">{value}</p><p className="metric-detail">{detail}</p></div>
  </div>;
}

function SectionHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="section-header"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{description && <p className="section-description">{description}</p>}</div>{action}</div>;
}

function ScoreBar({ value, color = "green" }: { value: number; color?: string }) {
  return <div className="score-bar"><span className={`score-fill ${color}`} style={{ width: `${value}%` }} /></div>;
}

function Home() {
  const [view, setView] = useState<View>("overview");
  const [springs, setSprings] = useState<Spring[]>(() => JSON.parse(localStorage.getItem("springsathi_springs") || "null") || seedSprings);
  const [work, setWork] = useState<Intervention[]>(() => JSON.parse(localStorage.getItem("springsathi_work") || "null") || seedWork);
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("All districts");
  const [toast, setToast] = useState<string | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [dialog, setDialog] = useState<"spring" | "work" | "assessment" | null>(null);
  const [selectedSpring, setSelectedSpring] = useState<Spring | null>(null);
  const [running, setRunning] = useState(false);
  const [springForm, setSpringForm] = useState({ name: "Akhra Source", village: "Akhra Toli", district: "Simdega", flow: "15", baseline: "26", season: "Seasonal", rainfall: "74", slope: "27", permeability: "High" });
  const [workForm, setWorkForm] = useState({ springId: "SPR-014", title: "Contour trench network", type: "Recharge trench", owner: "Gram Sabha", due: "10 Oct 2026" });

  useEffect(() => {
    localStorage.setItem("springsathi_springs", JSON.stringify(springs));
    localStorage.setItem("springsathi_work", JSON.stringify(work));
  }, [springs, work]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = (message: string) => setToast(message);
  const districts = ["All districts", ...Array.from(new Set(springs.map((item) => item.district)))];
  const filteredSprings = useMemo(() => springs.filter((item) => {
    const matchesSearch = `${item.name} ${item.village} ${item.district} ${item.id}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (district === "All districts" || item.district === district);
  }), [springs, search, district]);
  const prioritySprings = springs.filter((item) => item.status === "Priority").sort((a, b) => b.potential - a.potential);
  const avgFlow = Math.round(springs.reduce((sum, item) => sum + item.flow, 0) / springs.length);
  const activeWork = work.filter((item) => item.status !== "Complete").length;
  const completedWork = work.filter((item) => item.status === "Complete").length;

  const addSpring = () => {
    const flow = Number(springForm.flow) || 0;
    const baseline = Number(springForm.baseline) || 1;
    const rainfall = Number(springForm.rainfall) || 0;
    const slope = Number(springForm.slope) || 0;
    const potential = Math.min(96, Math.max(35, Math.round((rainfall * 0.45) + (slope * 0.55) + (springForm.permeability === "High" ? 18 : springForm.permeability === "Medium" ? 9 : 2) - flow)));
    const item: Spring = { id: `SPR-${String(34 + springs.length).padStart(3, "0")}`, name: springForm.name, village: springForm.village, district: springForm.district, flow, baseline, season: springForm.season, risk: flow < baseline * 0.7 ? "Recharge declining" : "New observation", potential, confidence: 69, status: potential >= 75 ? "Priority" : "Watch", rainfall, slope, permeability: springForm.permeability, community: 0, lastSurvey: fmtDate() };
    setSprings((current) => [item, ...current]);
    setDialog(null);
    notify(`${item.name} added to the spring registry`);
  };

  const createWork = () => {
    const spring = springs.find((item) => item.id === workForm.springId);
    if (!spring) return;
    const item: Intervention = { id: `WRK-${String(105 + work.length).padStart(3, "0")}`, springId: spring.id, title: workForm.title, village: spring.village, type: workForm.type, owner: workForm.owner, status: "Planned", due: workForm.due, impact: "Pending field validation" };
    setWork((current) => [item, ...current]);
    setDialog(null);
    notify("Intervention added to the field plan");
  };

  const advanceWork = (id: string) => {
    setWork((current) => current.map((item) => item.id !== id ? item : { ...item, status: item.status === "Planned" ? "In progress" : "Complete" }));
    notify("Field work status updated");
  };

  const runAssessment = () => {
    setRunning(true);
    window.setTimeout(() => {
      setSprings((current) => current.map((item) => ({ ...item, confidence: Math.min(96, item.confidence + 2) })));
      setRunning(false);
      setDialog(null);
      notify("Recharge assessment refreshed with explainable scores");
    }, 800);
  };

  const viewSpring = (spring: Spring) => { setSelectedSpring(spring); setDialog("assessment"); };

  const renderOverview = () => <>
    <div className="hero-panel">
      <div className="hero-copy"><p className="eyebrow light">SIH26240 · FIELD PLANNING PILOT</p><h1>Revive springs with evidence, local knowledge, and a plan people can act on.</h1><p>SpringSathi AI helps teams understand which recharge areas deserve attention first, then turns the assessment into field work and monitoring tasks.</p><div className="hero-actions"><button className="button white" onClick={() => setView("planner")}><Target size={16} />Open recharge planner</button><button className="button translucent" onClick={() => setDialog("spring")}><Plus size={16} />Add field observation</button></div></div>
      <div className="hero-visual"><div className="hero-rings ring-a" /><div className="hero-rings ring-b" /><div className="hero-water"><Waves size={34} /></div><div className="hero-tag tag-a"><CloudRain size={13} /> Rainfall</div><div className="hero-tag tag-b"><Mountain size={13} /> Terrain</div><div className="hero-tag tag-c"><Users size={13} /> Community</div></div>
    </div>
    <div className="metrics-grid">
      <Metric icon={Waves} label="Springs tracked" value={`${springs.length}`} detail="Across 4 pilot districts" tone="blue" />
      <Metric icon={AlertTriangle} label="Priority sources" value={`${prioritySprings.length}`} detail="Need recharge planning" tone="orange" />
      <Metric icon={Droplets} label="Average current flow" value={`${avgFlow} L/min`} detail="Compared with seasonal baseline" tone="aqua" />
      <Metric icon={Tractor} label="Active field plans" value={`${activeWork}`} detail={`${completedWork} completed`} tone="green" />
    </div>
    <div className="section-block"><SectionHeader eyebrow="Priority queue" title="Sources that need a decision" description="The prototype score combines observed flow decline, rainfall, slope, permeability, and community observations. It is a decision aid, not a replacement for field validation." action={<button className="text-button" onClick={() => setView("springs")}>View registry <ChevronRight size={14} /></button>} />
      <div className="priority-grid">{prioritySprings.slice(0, 3).map((spring) => <button className="priority-card" key={spring.id} onClick={() => viewSpring(spring)}><div className="priority-top"><span className="spring-symbol"><Waves size={17} /></span><StatusPill value={spring.status} /></div><h3>{spring.name}</h3><p>{spring.village}, {spring.district} · {spring.season}</p><div className="priority-score"><span>Recharge potential</span><strong>{spring.potential}%</strong></div><ScoreBar value={spring.potential} color="orange" /><div className="priority-foot"><span>{spring.flow} L/min now</span><span>{spring.confidence}% confidence <ChevronRight size={13} /></span></div></button>)}</div>
    </div>
    <div className="split-grid section-block"><div className="panel"><SectionHeader eyebrow="Planning signal" title="Recharge opportunity by factor" description="Read the recommendation before committing field resources." /><div className="factor-list"><div><span><CloudRain size={15} /> Rainfall contribution</span><strong>78%</strong></div><ScoreBar value={78} color="blue" /><div><span><Mountain size={15} /> Terrain slope</span><strong>66%</strong></div><ScoreBar value={66} color="orange" /><div><span><Leaf size={15} /> Vegetation recovery</span><strong>54%</strong></div><ScoreBar value={54} color="green" /><div><span><Users size={15} /> Community readiness</span><strong>82%</strong></div><ScoreBar value={82} color="purple" /></div><button className="button outline full" onClick={() => setDialog("assessment")}><CircleHelp size={15} />See how the score is built</button></div><div className="panel map-panel"><div className="map-head"><div><p className="eyebrow">Pilot region</p><h3>Spring and recharge view</h3></div><button className="icon-button" aria-label="Refresh assessment" onClick={runAssessment}><RefreshCw size={16} /></button></div><div className="mini-map"><div className="contour contour-one" /><div className="contour contour-two" /><div className="contour contour-three" />{springs.slice(0, 5).map((spring, index) => <button key={spring.id} className={`map-pin pin-${index + 1}`} title={spring.name} onClick={() => viewSpring(spring)}><span /><small>{spring.id}</small></button>)}<div className="map-legend"><span><i className="dot red" />Priority</span><span><i className="dot yellow" />Watch</span><span><i className="dot green" />Stable</span></div></div></div></div>
  </>;

  const renderSprings = () => <div className="space-y-6"><SectionHeader eyebrow="Spring registry" title="Field observations" description="Keep the source record simple enough for field teams and detailed enough for planning." action={<button className="button primary" onClick={() => setDialog("spring")}><Plus size={16} />Add observation</button>} /><div className="toolbar"><div className="search-box"><Search size={15} /><input aria-label="Search springs" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, village, or ID" /></div><div className="select-wrap"><Filter size={14} /><select aria-label="Filter by district" value={district} onChange={(event) => setDistrict(event.target.value)}>{districts.map((item) => <option key={item}>{item}</option>)}</select></div><button className="button outline" onClick={() => setDialog("assessment")}><Settings2 size={15} />Run assessment</button></div><div className="table-card"><table><thead><tr><th>Spring source</th><th>Current flow</th><th>Recharge potential</th><th>Risk signal</th><th>Surveyed</th><th /></tr></thead><tbody>{filteredSprings.map((spring) => <tr key={spring.id}><td><div className="table-title"><span className="table-icon"><Waves size={15} /></span><span><strong>{spring.name}</strong><small>{spring.id} · {spring.village}, {spring.district}</small></span></div></td><td><strong>{spring.flow} L/min</strong><small>{spring.baseline} baseline</small></td><td><div className="table-score"><strong>{spring.potential}%</strong><ScoreBar value={spring.potential} color={spring.status === "Priority" ? "orange" : "green"} /></div></td><td><StatusPill value={spring.risk} /></td><td>{spring.lastSurvey}</td><td><button className="table-action" onClick={() => viewSpring(spring)}>Review <ChevronRight size={14} /></button></td></tr>)}</tbody></table>{!filteredSprings.length && <div className="empty-state"><Waves size={26} /><h3>No spring records match</h3><p>Try another search or add a new field observation.</p></div>}</div></div>;

  const renderPlanner = () => <div className="space-y-6"><SectionHeader eyebrow="Recharge planner" title="Turn signals into a field plan" description="Prioritise work by potential, confidence, and local readiness. Every recommendation stays explainable." action={<button className="button primary" onClick={() => setDialog("work")}><Plus size={16} />Create intervention</button>} /><div className="planner-grid"><div className="panel planner-map"><div className="map-head"><div><h3>Recharge candidate map</h3><p>Illustrative pilot layer · replace with local GIS and hydrogeology data</p></div><button className="button outline small" onClick={runAssessment}><RefreshCw size={14} className={running ? "spin" : ""} />{running ? "Assessing" : "Refresh score"}</button></div><div className="large-map"><div className="ridge ridge-one" /><div className="ridge ridge-two" /><div className="ridge ridge-three" /><div className="stream" />{springs.map((spring, index) => <button key={spring.id} className={`map-marker marker-${index + 1} ${spring.status.toLowerCase()}`} onClick={() => viewSpring(spring)}><span><Waves size={14} /></span><b>{spring.id}</b></button>)}<div className="map-scale">North ↑<br /><span>1 km</span></div></div></div><div className="panel candidate-panel"><div className="panel-heading"><div><p className="eyebrow">Recommended sequence</p><h3>Start with these sources</h3></div><span className="ai-badge"><SparkIcon />Explainable score</span></div>{prioritySprings.map((spring, index) => <button className="candidate-row" key={spring.id} onClick={() => viewSpring(spring)}><span className="rank">0{index + 1}</span><span className="candidate-copy"><strong>{spring.name}</strong><small>{spring.village} · {spring.risk}</small><ScoreBar value={spring.potential} color="orange" /></span><span className="candidate-score"><strong>{spring.potential}%</strong><small>{spring.confidence}% confidence</small></span></button>)}<div className="assumption-note"><CircleHelp size={15} /><span><strong>Planning note:</strong> The score is a transparent prototype model. Validate recharge boundaries with hydrologists and community members before construction.</span></div></div></div><div className="three-step"><div><span>01</span><strong>Assess</strong><p>Combine flow, rainfall, slope, soil, and local observations.</p></div><ChevronRight /><div><span>02</span><strong>Prioritise</strong><p>Compare potential, confidence, risk, and readiness.</p></div><ChevronRight /><div><span>03</span><strong>Act and learn</strong><p>Track interventions and update the source record.</p></div></div></div>;

  const renderFieldwork = () => <div className="space-y-6"><SectionHeader eyebrow="Field work" title="Interventions in motion" description="Keep the plan visible to the people who will build, verify, and maintain it." action={<button className="button primary" onClick={() => setDialog("work")}><Plus size={16} />Add field plan</button>} /><div className="work-summary"><div><span>Planned</span><strong>{work.filter((item) => item.status === "Planned").length}</strong></div><div><span>In progress</span><strong>{work.filter((item) => item.status === "In progress").length}</strong></div><div><span>Complete</span><strong>{work.filter((item) => item.status === "Complete").length}</strong></div><div><span>Community owners</span><strong>{new Set(work.map((item) => item.owner)).size}</strong></div></div><div className="work-grid">{work.map((item) => <div className="work-card" key={item.id}><div className="work-card-top"><span className="work-icon"><Sprout size={18} /></span><StatusPill value={item.status} /></div><p className="eyebrow">{item.id} · {item.type}</p><h3>{item.title}</h3><p className="work-location"><MapPinned size={14} />{item.village} · owner: {item.owner}</p><div className="work-impact"><span>Expected impact</span><strong>{item.impact}</strong></div><div className="work-footer"><span>Due {item.due}</span>{item.status !== "Complete" ? <button className="text-button" onClick={() => advanceWork(item.id)}>{item.status === "Planned" ? "Start work" : "Mark complete"}<ChevronRight size={14} /></button> : <span className="verified"><CheckCircle2 size={14} />Verified</span>}</div></div>)}</div></div>;

  const renderMonitoring = () => <div className="space-y-6"><SectionHeader eyebrow="Monitoring" title="Measure what changes" description="A simple before-and-after view keeps spring revival tied to evidence from the field." action={<button className="button outline" onClick={() => notify("Monitoring report prepared for review")}><FileText size={15} />Prepare report</button>} /><div className="monitor-grid"><div className="panel chart-panel"><div className="panel-heading"><div><h3>Flow trend across priority springs</h3><p>Illustrative monthly observations in L/min</p></div><span className="trend-up"><ArrowUpRight size={15} />+14% after works</span></div><div className="chart"><div className="y-labels"><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span></div><div className="chart-area"><div className="grid-lines"><i /><i /><i /><i /><i /></div><div className="bars">{[17, 21, 18, 26, 23, 30, 28, 35, 32, 37, 33, 39].map((height, index) => <div className="bar-group" key={index}><span style={{ height: `${height * 3.7}px` }} /><small>{["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"][index]}</small></div>)}</div></div></div><div className="chart-legend"><span><i className="legend-blue" />Observed flow</span><span><i className="legend-green" />Target range</span></div></div><div className="panel outcome-panel"><div className="panel-heading"><div><p className="eyebrow">Outcome snapshot</p><h3>Source health</h3></div><Gauge size={20} className="panel-accent" /></div><div className="outcome-row"><span><Waves size={15} />Spring flow stability</span><strong>68%</strong></div><ScoreBar value={68} color="blue" /><div className="outcome-row"><span><Leaf size={15} />Catchment recovery</span><strong>54%</strong></div><ScoreBar value={54} color="green" /><div className="outcome-row"><span><Users size={15} />Community verification</span><strong>83%</strong></div><ScoreBar value={83} color="purple" /><div className="outcome-callout"><ShieldCheck size={17} /><span><strong>Evidence reminder</strong> Record flow in the same units and at comparable points in the season.</span></div></div></div><div className="panel"><SectionHeader eyebrow="Recent observations" title="What field teams reported" /><div className="observation-list"><div><span className="obs-avatar">KP</span><p><strong>Kharpani team</strong> reported clearer flow after the first contour trench section was completed.<small>18 Sep 2026 · linked to SPR-014</small></p><StatusPill value="Verified" /></div><div><span className="obs-avatar blue">BS</span><p><strong>Banspahari group</strong> marked the upper slope as accessible for vegetation restoration.<small>16 Sep 2026 · linked to SPR-021</small></p><StatusPill value="Review" /></div><div><span className="obs-avatar orange">SK</span><p><strong>Salki water committee</strong> requested a site visit before check dam placement.<small>14 Sep 2026 · linked to SPR-033</small></p><StatusPill value="Priority" /></div></div></div></div>;

  const renderDialog = () => {
    if (!dialog) return null;
    if (dialog === "assessment") {
      const spring = selectedSpring;
      return <div className="modal-backdrop" onClick={() => setDialog(null)}><div className="modal wide-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setDialog(null)} aria-label="Close"><X size={18} /></button><p className="eyebrow">Explainable planning model</p><h2>{spring ? `${spring.name} assessment` : "How the recharge score works"}</h2>{spring ? <><p className="modal-copy">The current prototype score uses observed conditions to suggest where field validation may be most useful. It does not establish a recharge boundary on its own.</p><div className="assessment-head"><div className="big-score">{spring.potential}%<small>recharge potential</small></div><div><StatusPill value={scoreLabel(spring.potential)} /><p>{spring.confidence}% confidence based on available observations</p></div></div><div className="assessment-factors"><div><span>Observed flow decline</span><strong>{Math.max(0, Math.round((1 - spring.flow / spring.baseline) * 100))}%</strong><ScoreBar value={Math.max(0, Math.round((1 - spring.flow / spring.baseline) * 100))} color="orange" /></div><div><span>Rainfall contribution</span><strong>{spring.rainfall}%</strong><ScoreBar value={spring.rainfall} color="blue" /></div><div><span>Terrain and permeability</span><strong>{Math.min(96, spring.slope + (spring.permeability === "High" ? 48 : 30))}%</strong><ScoreBar value={Math.min(96, spring.slope + (spring.permeability === "High" ? 48 : 30))} color="green" /></div><div><span>Community readiness</span><strong>{spring.community ? `${spring.community}/5` : "Pending"}</strong><ScoreBar value={spring.community ? spring.community * 20 : 30} color="purple" /></div></div><button className="button primary full" onClick={() => { setDialog("work"); setWorkForm((current) => ({ ...current, springId: spring.id })); }}>Create intervention for this spring</button></> : <><p className="modal-copy">SpringSathi AI makes the signal visible by showing the factors behind a recommendation. A field team should combine this view with hydrogeological surveys, local knowledge, and community approval.</p><div className="explain-grid"><div><CloudRain size={19} /><strong>Rainfall</strong><p>Recent and seasonal rainfall contributes to the recharge signal.</p></div><div><Mountain size={19} /><strong>Terrain</strong><p>Slope and permeability help indicate where water may move or collect.</p></div><div><Waves size={19} /><strong>Flow change</strong><p>Current flow is compared with a seasonal baseline.</p></div><div><Users size={19} /><strong>Community</strong><p>Local observations add context and improve implementation readiness.</p></div></div><button className="button primary full" onClick={runAssessment}>{running ? "Refreshing assessment..." : "Refresh all confidence scores"}</button></>}</div></div>;
    }
    if (dialog === "spring") return <div className="modal-backdrop" onClick={() => setDialog(null)}><div className="modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setDialog(null)} aria-label="Close"><X size={18} /></button><p className="eyebrow">Field observation</p><h2>Add a spring source</h2><p className="modal-copy">Enter the latest observation. The prototype calculates a transparent priority score from these inputs.</p><div className="form-grid"><label>Spring name<input value={springForm.name} onChange={(event) => setSpringForm({ ...springForm, name: event.target.value })} /></label><label>Village / tola<input value={springForm.village} onChange={(event) => setSpringForm({ ...springForm, village: event.target.value })} /></label><label>District<select value={springForm.district} onChange={(event) => setSpringForm({ ...springForm, district: event.target.value })}>{["Simdega", "Gumla", "Khunti", "West Singhbhum"].map((item) => <option key={item}>{item}</option>)}</select></label><label>Seasonality<select value={springForm.season} onChange={(event) => setSpringForm({ ...springForm, season: event.target.value })}><option>Perennial</option><option>Seasonal</option></select></label><label>Current flow (L/min)<input type="number" value={springForm.flow} onChange={(event) => setSpringForm({ ...springForm, flow: event.target.value })} /></label><label>Seasonal baseline<input type="number" value={springForm.baseline} onChange={(event) => setSpringForm({ ...springForm, baseline: event.target.value })} /></label><label>Rainfall contribution<input type="number" min="0" max="100" value={springForm.rainfall} onChange={(event) => setSpringForm({ ...springForm, rainfall: event.target.value })} /></label><label>Slope indicator<input type="number" min="0" max="60" value={springForm.slope} onChange={(event) => setSpringForm({ ...springForm, slope: event.target.value })} /></label><label>Permeability<select value={springForm.permeability} onChange={(event) => setSpringForm({ ...springForm, permeability: event.target.value })}><option>High</option><option>Medium</option><option>Low</option></select></label></div><button className="button primary full" onClick={addSpring}><Check size={16} />Save field observation</button></div></div>;
    return <div className="modal-backdrop" onClick={() => setDialog(null)}><div className="modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setDialog(null)} aria-label="Close"><X size={18} /></button><p className="eyebrow">Field implementation</p><h2>Create an intervention plan</h2><p className="modal-copy">Choose a source, assign an intervention, and keep the owner and due date visible.</p><div className="form-grid"><label>Spring source<select value={workForm.springId} onChange={(event) => setWorkForm({ ...workForm, springId: event.target.value })}>{springs.map((item) => <option key={item.id} value={item.id}>{item.id} · {item.name}</option>)}</select></label><label>Intervention type<select value={workForm.type} onChange={(event) => setWorkForm({ ...workForm, type: event.target.value })}><option>Recharge trench</option><option>Check dam</option><option>Catchment restoration</option><option>Spring protection</option></select></label><label className="wide-field">Plan title<input value={workForm.title} onChange={(event) => setWorkForm({ ...workForm, title: event.target.value })} /></label><label>Community owner<input value={workForm.owner} onChange={(event) => setWorkForm({ ...workForm, owner: event.target.value })} /></label><label>Target date<input value={workForm.due} onChange={(event) => setWorkForm({ ...workForm, due: event.target.value })} /></label></div><button className="button primary full" onClick={createWork}><Check size={16} />Add to field plan</button></div></div>;
  };

  const currentNav = navItems.find((item) => item.id === view) || navItems[0];
  return <div className="app-shell">
    <header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Open navigation"><Menu size={21} /></button><div className="brand-lockup"><div className="brand-mark"><Droplets size={20} /></div><div><strong>SpringSathi AI</strong><span>Water planning for tribal areas</span></div></div><div className="problem-chip"><span className="live-dot" />SIH26240 <small>Prototype workspace</small></div><div className="top-actions"><button className="icon-button" aria-label="Notifications" onClick={() => notify("No new field alerts") }><Bell size={18} /><span className="notification-dot" /></button><button className="help-button" onClick={() => setDialog("assessment")}><CircleHelp size={16} />Method</button><div className="avatar">SM</div></div></header>
    <div className="app-body"><aside className={`sidebar ${mobileNav ? "open" : ""}`}><div className="sidebar-context"><div className="context-icon"><Mountain size={17} /></div><div><span>Planning area</span><strong>Jharkhand pilot</strong></div></div><nav className="side-nav">{navItems.map((item) => { const Icon = item.icon; return <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => { setView(item.id); setMobileNav(false); }}><Icon size={17} /><span><strong>{item.label}</strong><small>{item.hint}</small></span>{view === item.id && <i className="nav-active-bar" />}</button>; })}</nav><div className="sidebar-bottom"><div className="trust-card"><ShieldCheck size={18} /><div><strong>Human-in-the-loop</strong><span>Recommendations stay reviewable by field teams.</span></div></div><button className="sidebar-help" onClick={() => notify("Field data should be validated locally before implementation") }><CircleHelp size={15} />Prototype assumptions</button></div></aside><main className="main-content"><div className="breadcrumb"><span>SpringSathi AI</span><ChevronRight size={13} /><strong>{currentNav.label}</strong></div>{view === "overview" && renderOverview()}{view === "springs" && renderSprings()}{view === "planner" && renderPlanner()}{view === "fieldwork" && renderFieldwork()}{view === "monitoring" && renderMonitoring()}</main></div>{toast && <div className="toast"><CheckCircle2 size={17} /><span>{toast}</span><button onClick={() => setToast(null)} aria-label="Dismiss"><X size={14} /></button></div>}{renderDialog()}
  </div>;
}

function SparkIcon() { return <span className="spark-icon">✦</span>; }

export default Home;
