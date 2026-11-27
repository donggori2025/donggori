"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Check, ChevronDown, Layers, List, RotateCcw, Search, X } from "lucide-react";
import { fetchFactoriesFromDB, isSelectableRegion, productionItems } from "@/lib/factoryCatalog";
import { directoryHref, EMPTY_FILTERS, filterDirectoryFactories, moqRanges, readDirectoryQuery, type DirectoryFilters } from "@/lib/factoryDirectoryFilters";
import { groupDistrictFactories, type MapMode } from "@/lib/dongdaemunMap";
import { toMapFactory, type MapFactory } from "@/lib/factoryMapRows";
import NaverMap from "@/components/NaverMap";
import "./explorer.css";

const filterGroups = [
  ["admin_district", "등록 지역"], ["items", "제작 품목"], ["factory_type", "공장 유형"],
  ["main_fabrics", "작업 원단"], ["moq", "최소 주문 수량"], ["sewing_machines", "재봉기"],
  ["pattern_machines", "패턴기"], ["special_machines", "특수기"],
] as const;
const chips = [
  { label: "지역", keys: ["admin_district"] }, { label: "제작 품목", keys: ["items"] },
  { label: "공장 유형", keys: ["factory_type"] }, { label: "원단", keys: ["main_fabrics"] },
  { label: "최소 주문 수량", keys: ["moq"] }, { label: "설비", keys: ["sewing_machines", "pattern_machines", "special_machines"] },
] satisfies { label: string; keys: (typeof filterGroups[number][0])[] }[];
const modePanel = "지도 표시 기준";

function saveMapQuery(filters: DirectoryFilters, query: string, mode: MapMode, pin: string | null) {
  const url = new URL(directoryHref("/factories", filters, query), window.location.origin);
  if (mode === "position") url.searchParams.set("mode", mode);
  if (pin) url.searchParams.set("pin", pin);
  window.history.replaceState(null, "", url);
}

function getOptions(rows: MapFactory[], key: typeof filterGroups[number][0]) {
  if (key === "moq") return moqRanges.map(range => range.label);
  const options = rows.flatMap(factory => key === "items" ? productionItems(factory) :
    String(factory[key] ?? "").split(",").map(value => value.trim()));
  return [...new Set(options.filter(value => value && (key !== "admin_district" || isSelectableRegion(value))))]
    .sort((a, b) => a.localeCompare(b, "ko", { numeric: true }));
}

export default function FactoryMapExplorer({ initialRows }: { initialRows: MapFactory[] | null }) {
  const [rows, setRows] = useState<MapFactory[]>(initialRows ?? []);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(initialRows ? "ready" : "loading");
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState(EMPTY_FILTERS);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<MapMode>("district");
  const [panel, setPanel] = useState<string | null>(null);
  const [resultsOpen, setResultsOpen] = useState(true);
  const [pinKey, setPinKey] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const resultButton = useRef<HTMLButtonElement>(null);
  const toolbar = useRef<HTMLDivElement>(null);
  const chipButton = useRef<HTMLButtonElement | null>(null);
  const dropdown = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState(0);
  const currentChip = chips.find(chip => chip.label === panel);

  useEffect(() => {
    function restore() {
      const params = new URLSearchParams(window.location.search);
      const query = readDirectoryQuery(params);
      setSelected(query.selected);
      setSearch(query.search);
      setMode(params.get("mode") === "position" ? "position" : "district");
      setPinKey(params.get("pin"));
      setPanel(null);
      setResultsOpen(true);
      setLimit(20);
    }
    restore();
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  useEffect(() => {
    if (initialRows) return;
    const controller = new AbortController();
    fetchFactoriesFromDB(controller.signal).then(data => {
      if (controller.signal.aborted) return;
      setRows(data.map(toMapFactory));
      setStatus("ready");
    }).catch(() => { if (!controller.signal.aborted) setStatus("error"); });
    return () => controller.abort();
  }, [attempt, initialRows]);
  const options = useMemo(() => filterGroups.map(([key, label]) => ({ key, label, values: getOptions(rows, key) })), [rows]);
  const matches = useMemo(() => filterDirectoryFactories(rows, selected, search.trim()), [rows, selected, search]);
  const pins = useMemo(() => groupDistrictFactories(matches, mode), [matches, mode]);
  const mapped = pins.reduce((sum, pin) => sum + pin.factories.length, 0);
  const pin = pins.find(item => item.key === pinKey);
  const results = pin?.factories ?? matches;
  const activeCount = Object.values(selected).reduce((sum, values) => sum + values.length, 0);
  function updateFilters(next: DirectoryFilters, query: string) {
    setSelected(next);
    setSearch(query);
    setPinKey(null);
    setLimit(20);
    saveMapQuery(next, query, mode, null);
  }
  function showResults(key: string | null) {
    setResultsOpen(true);
    setPanel(null);
    setPinKey(key);
    setLimit(20);
    saveMapQuery(selected, search, mode, key);
  }
  function openChip(event: MouseEvent<HTMLButtonElement>, label: string) {
    chipButton.current = event.currentTarget;
    setAnchor(event.currentTarget.getBoundingClientRect().left - (toolbar.current?.getBoundingClientRect().left ?? 0));
    setPanel(panel === label ? null : label);
  }
  function closePanel() {
    setPanel(null);
    chipButton.current?.focus();
  }
  function closeResults() {
    setResultsOpen(false);
    resultButton.current?.focus();
  }
  useEffect(() => {
    if (resultsOpen && pinKey) resultsHeading.current?.focus({ preventScroll: true });
  }, [resultsOpen, pinKey]);
  useEffect(() => {
    if (!currentChip && panel !== modePanel) return;
    dropdown.current?.focus({ preventScroll: true });
    const dismiss = (event: PointerEvent) => {
      if (!toolbar.current?.contains(event.target as Node)) setPanel(null);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [currentChip, panel]);

  return (
    <section className="factory-explorer" aria-labelledby="explorer-title" onKeyDown={e => {
      if (e.key !== "Escape") return;
      if (panel) closePanel();
      else if (resultsOpen) closeResults();
    }}>
      <div className="explorer-toolbar" ref={toolbar}>
        <div className="explorer-bar-inner">
          <h1 id="explorer-title" className="sr-only">봉제공장 지도</h1>
          <label className="explorer-search">
            <Search size={17} aria-hidden />
            <input aria-label="공장명 또는 제작 품목 검색" type="search" placeholder="공장명 또는 제작 품목"
              value={search} onFocus={() => setPanel(null)}
              onChange={e => updateFilters(selected, e.target.value)} />
          </label>
          <div className="explorer-chips" role="group" aria-label="공장 필터">
            {chips.map(chip => {
              const values = chip.keys.flatMap(key => selected[key]);
              const open = panel === chip.label;
              return <button type="button" key={chip.label} className="explorer-chip" aria-expanded={open}
                aria-controls={open ? "explorer-filter-options" : undefined} data-active={values.length > 0}
                onClick={e => openChip(e, chip.label)}>
                {chip.label}{values.length > 0 && <b>{values.length === 1 ? values[0] + (chip.keys[0] === "moq" ? "장" : "") : values.length}</b>}<ChevronDown size={14} aria-hidden />
              </button>;
            })}
            <button type="button" className="explorer-chip explorer-mode-chip" aria-expanded={panel === modePanel}
              aria-label={modePanel + " · " + (mode === "district" ? "등록 동별" : "공개 위치별")}
              aria-controls={panel === modePanel ? "explorer-mode" : undefined} onClick={e => openChip(e, modePanel)}>
              <Layers size={14} />{mode === "district" ? "등록 동별" : "공개 위치별"}<ChevronDown size={14} />
            </button>
            {(activeCount > 0 || search) && <button type="button" className="explorer-reset" aria-label="검색과 모든 조건 초기화"
              onClick={() => { updateFilters(EMPTY_FILTERS, ""); setPanel(null); }}><RotateCcw size={14} /> 초기화</button>}
          </div>
          <button ref={resultButton} type="button" className="explorer-results-toggle" aria-expanded={resultsOpen}
            aria-controls={resultsOpen ? "explorer-results" : undefined}
            onClick={() => { setPanel(null); setResultsOpen(!resultsOpen); }}>
            <List size={17} /> 검색 결과 {status === "ready" && <b>{matches.length}</b>}
          </button>
        </div>
        {currentChip && <div id="explorer-filter-options" className="explorer-menu" ref={dropdown} tabIndex={-1}
          role="region" aria-label={currentChip.label + " 필터"} style={{ "--chip-left": anchor + "px" } as CSSProperties}>
          <div className="explorer-panel-head"><h2>{currentChip.label}</h2>
            <button aria-label="필터 닫기" onClick={closePanel}><X size={17} /></button>
          </div>
          <div className="explorer-scroll explorer-options">
            {options.filter(option => currentChip.keys.some(key => key === option.key)).map(({key, label, values}) => (
              <fieldset key={key}><legend className={currentChip.keys.length === 1 ? "sr-only" : undefined}>{label}</legend>
                <div>{values.map(value => {
                  const checked = selected[key].includes(value);
                  return <label key={value}>
                    <input type="checkbox" className="sr-only" checked={checked} onChange={() => updateFilters({
                      ...selected, [key]: checked ? selected[key].filter(item => item !== value) : [...selected[key], value],
                    }, search)} />
                    <span>{checked && <Check size={13} />}{value}{key === "moq" && "장"}</span>
                  </label>;
                })}{!values.length && <small>{status === "loading" ? "불러오는 중…" : "등록된 조건이 없습니다."}</small>}</div>
              </fieldset>
            ))}
          </div>
          <div className="explorer-panel-foot">
            <button disabled={!currentChip.keys.some(key => selected[key].length)}
              onClick={() => {
                const next = { ...selected };
                for (const key of currentChip.keys) next[key] = [];
                updateFilters(next, search);
              }}>선택 해제</button>
            <button className="explorer-primary" onClick={closePanel}>지도 보기</button>
          </div>
        </div>}
        {panel === modePanel && <div id="explorer-mode" className="explorer-menu" ref={dropdown} tabIndex={-1}
          role="region" aria-label={modePanel} style={{ "--chip-left": anchor + "px" } as CSSProperties}>
          <div className="explorer-panel-head"><h2>{modePanel}</h2><button aria-label="표시 기준 닫기" onClick={closePanel}><X size={17} /></button></div>
          <div className="explorer-mode-options">
            {(["district", "position"] as const).map(value => <button key={value} aria-pressed={mode === value} onClick={() => {
              setMode(value); setPinKey(null); setPanel(null); chipButton.current?.focus();
              saveMapQuery(selected, search, value, null);
            }}>
              <span>{value === "district" ? "등록 동별" : "공개 위치별"}<small>{value === "district" ? "등록한 동의 대표 지점에 모아 표시" : "공개 좌표가 같은 공장을 모아 표시"}</small></span>
              {mode === value && <Check size={16} />}
            </button>)}
          </div>
        </div>}
      </div>
      <div className="explorer-map-area">
        <div className="explorer-map-pane">
          <NaverMap pins={pins} mode={mode} selectedKey={pinKey} onSelect={next => showResults(next.key)} />
          {(!resultsOpen || status !== "ready") && <div className="explorer-status" role="status">
            {status === "loading" ? "공장 정보를 불러오는 중…" : status === "error" ? "공장 정보를 불러오지 못했습니다." :
              `전체 결과 ${matches.length}곳 · 지도 표시 가능 ${mapped}곳`}
            {status === "error" && <button onClick={() => { setStatus("loading"); setAttempt(attempt + 1); }}>다시 시도</button>}
          </div>}
        </div>
        {resultsOpen && (
          <aside id="explorer-results" className="explorer-panel" aria-labelledby="explorer-results-title">
            <div className="explorer-panel-head">
              <div aria-live="polite">
                <h2 id="explorer-results-title" ref={resultsHeading} tabIndex={-1}>{pin?.label || "검색 결과"} <span>{status === "ready" && `${results.length}곳`}</span></h2>
                {status === "ready" && !pin && <p className="explorer-mapped-count">지도에 표시된 공장 {mapped}곳</p>}
              </div>
              <button aria-label="검색 결과 닫기" onClick={closeResults}><X size={18} /></button>
            </div>
            {pin && <button className="explorer-back-results" onClick={() => showResults(null)}>← 전체 검색 결과 {matches.length}곳</button>}
            <div className="explorer-scroll" key={pinKey} aria-busy={status === "loading"}>
              {status !== "ready" && <p className="explorer-empty">{status === "loading" ? "공장을 불러오는 중…" : "공장 목록을 불러오지 못했습니다."}</p>}
              {results.slice(0, limit).map(f => {
                const photo = f.image;
                return <Link href={`/factories/${f.id}`} key={f.id} className="explorer-result" prefetch={false}>
                  <span><small>{[f.admin_district, f.factory_type].filter(Boolean).join(" · ")}</small>
                    <strong>{f.company_name || f.name}</strong><span>{productionItems(f).slice(0, 2).join(" · ")}</span></span>
                  {photo && <Image alt="" src={photo} width={52} height={52} />}
                  <ArrowUpRight size={16} />
                </Link>;
              })}
              {results.length > limit && <button className="explorer-more" onClick={() => setLimit(limit + 20)}>업체 더 보기</button>}
              {status === "ready" && !results.length && <p className="explorer-empty">조건에 맞는 공장이 없습니다.</p>}
            </div>
            <Link className="explorer-list-link" href={directoryHref("/factories/list", selected, search)}>카드 목록으로 보기 <ArrowRight size={15} /></Link>
          </aside>
        )}
      </div>
    </section>
  );
}
