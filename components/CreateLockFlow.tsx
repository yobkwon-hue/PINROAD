'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { getAnonymousUserId } from '@/lib/anonymous-user';
import {
  LockColor,
  LockShape,
  LockVisibility,
  COLOR_HEX,
  COLOR_LABEL,
  SHAPE_LABEL,
  VISIBILITY_META,
} from '@/lib/types';
import { buildLockSvg } from '@/lib/lockSvg';
import { toast } from '@/components/Toast';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

interface CreatedLock {
  id: string;
  lat: number;
  lng: number;
}

interface Props {
  onClose: () => void;
  onCreated: (created?: CreatedLock) => void;
}

const COLORS: LockColor[] = ['pink', 'red', 'yellow', 'sky', 'purple'];
const SHAPES: LockShape[] = ['heart', 'square', 'circle'];
const VISIBILITIES: LockVisibility[] = ['public', 'private', 'link'];

const DRAFT_KEY = 'bakje_draft_v1';

interface Draft {
  title: string;
  body: string;
  color: LockColor;
  shape: LockShape;
  visibility: LockVisibility;
  position: { lat: number; lng: number } | null;
  locationName: string;
}

function loadDraft(): Partial<Draft> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<Draft>;
  } catch {
    return null;
  }
}

function saveDraft(d: Draft) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    /* quota / private mode — silently ignore */
  }
}

function clearDraft() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export default function CreateLockFlow({ onClose, onCreated }: Props) {
  const initial = typeof window !== 'undefined' ? loadDraft() : null;
  const [step, setStep] = useState(1);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initial?.position ?? null,
  );
  const [locationName, setLocationName] = useState(initial?.locationName ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [color, setColor] = useState<LockColor>(initial?.color ?? 'pink');
  const [shape, setShape] = useState<LockShape>(initial?.shape ?? 'heart');
  const [visibility, setVisibility] = useState<LockVisibility>(initial?.visibility ?? 'public');
  const [saving, setSaving] = useState(false);
  const [savedToken, setSavedToken] = useState<string | null>(null);

  // Persist a draft on every meaningful change so a closed-by-accident
  // flow doesn't lose the user's typing. Cleared on submit success.
  useEffect(() => {
    saveDraft({ title, body, color, shape, visibility, position, locationName });
  }, [title, body, color, shape, visibility, position, locationName]);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      toast('이 브라우저는 위치 못 잡음 ㅠ', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition({ lat, lng });
        reverseGeocode(lat, lng);
      },
      () => toast('위치 못 가져옴 — 권한 확인 ㄱㄱ', 'error'),
    );
  }

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const url = new URL('https://nominatim.openstreetmap.org/reverse');
      url.searchParams.set('lat', String(lat));
      url.searchParams.set('lon', String(lng));
      url.searchParams.set('format', 'json');
      url.searchParams.set('accept-language', 'ko');
      url.searchParams.set('zoom', '14');
      const res = await fetch(url.toString(), {
        headers: { Accept: 'application/json' },
      });
      const data = (await res.json()) as {
        display_name?: string;
        address?: Record<string, string>;
      };
      // Prefer Korean-style short hierarchy: city/borough/neighborhood
      const a = data?.address ?? {};
      const parts = [
        a.city ?? a.province ?? a.state,
        a.borough ?? a.county ?? a.suburb,
        a.neighbourhood ?? a.quarter ?? a.village,
      ].filter(Boolean);
      const name = parts.join(' ') || data?.display_name || '';
      if (name) setLocationName(name);
    } catch {
      /* keep coordinates as fallback */
    }
  }

  function handlePick(lat: number, lng: number) {
    setPosition({ lat, lng });
    reverseGeocode(lat, lng);
  }

  async function submit() {
    if (!position) return;
    setSaving(true);
    const shareToken =
      visibility === 'link'
        ? (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`)
        : null;

    const { data, error } = await supabase
      .from('locks')
      .insert({
        user_id: getAnonymousUserId(),
        lat: position.lat,
        lng: position.lng,
        location_name: locationName || null,
        title,
        body,
        color,
        shape,
        visibility,
        share_token: shareToken,
      })
      .select()
      .single();

    setSaving(false);
    if (error) {
      console.error(error);
      toast('박제 실패 ㅠ 다시 ㄱㄱ', 'error');
      return;
    }
    clearDraft();
    toast('박제 완료 🔒✨', 'success');
    if (visibility === 'link' && data?.share_token) {
      setSavedToken(data.share_token);
    } else if (data) {
      onCreated({ id: data.id, lat: data.lat, lng: data.lng });
    } else {
      onCreated();
    }
  }

  const back = () => {
    if (savedToken) return onCreated();
    if (step === 1) return onClose();
    setStep((s) => s - 1);
  };

  // Esc closes the whole flow (mirrors LockModal). Step-back stays on the back button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex animate-fade-in flex-col bg-bg/95 backdrop-blur-md">
      <header className="flex shrink-0 items-center justify-between border-b-2 border-black/40 bg-bg/90 px-4 py-3">
        <button
          onClick={back}
          className="sticker-btn !py-2 !px-3 bg-white text-sm text-black"
        >
          {step === 1 || savedToken ? '✕' : '←'}
        </button>
        <div className="font-display text-sm text-cyber-pink">
          {savedToken ? '박제 완료 ✨' : `STEP ${step} / 4`}
        </div>
        <div className="w-12" />
      </header>

      {!savedToken && (
        <div className="flex shrink-0 justify-center gap-2 py-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`h-2 rounded-full border-2 border-black transition-all ${
                n <= step ? 'w-10 bg-cyber-pink' : 'w-2 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        {savedToken ? (
          <DoneLinkScreen token={savedToken} onDone={onCreated} />
        ) : step === 1 ? (
          <Step1Location
            position={position}
            locationName={locationName}
            onPick={handlePick}
            onUseCurrent={useCurrentLocation}
          />
        ) : step === 2 ? (
          <Step2Message
            title={title}
            setTitle={setTitle}
            body={body}
            setBody={setBody}
            onResetDraft={() => {
              setTitle('');
              setBody('');
              clearDraft();
              toast('임시 저장 지움 ↺', 'info');
            }}
          />
        ) : step === 3 ? (
          <Step3Design
            color={color}
            setColor={setColor}
            shape={shape}
            setShape={setShape}
          />
        ) : (
          <Step4Visibility visibility={visibility} setVisibility={setVisibility} />
        )}
      </main>

      {!savedToken && (
        <footer className="shrink-0 border-t-2 border-black/40 bg-bg/90 px-4 py-4">
          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={
                (step === 1 && !position) ||
                (step === 2 && (!title.trim() || !body.trim()))
              }
              className="sticker-btn w-full bg-cyber-pink text-base text-white"
            >
              다음 →
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={saving}
              className="sticker-btn w-full bg-holo text-base text-black font-display tracking-wide"
            >
              {saving ? '박제중...' : '여기 박제하기 🔒✨'}
            </button>
          )}
        </footer>
      )}
    </div>
  );
}

/* ─────────────────────────── Step 1: Location ─────────────────────────── */
function Step1Location({
  position,
  locationName,
  onPick,
  onUseCurrent,
}: {
  position: { lat: number; lng: number } | null;
  locationName: string;
  onPick: (lat: number, lng: number) => void;
  onUseCurrent: () => void;
}) {
  return (
    <div className="relative h-full">
      <MapView
        locks={[]}
        onMapClick={onPick}
        selectedPosition={position}
        className="absolute inset-0 z-0"
      />
      <div className="pointer-events-none absolute inset-x-0 top-3 z-[500] flex justify-center">
        <div className="sticker pointer-events-auto bg-white px-4 py-2 text-sm font-extrabold text-black">
          여기다 박제? 📍 지도 찍어
        </div>
      </div>
      <button
        onClick={onUseCurrent}
        className="sticker-btn absolute right-3 top-16 z-[500] bg-cyber-blue text-sm text-black"
      >
        📡 현위치
      </button>
      {position && (
        <div className="absolute inset-x-3 bottom-3 z-[500]">
          <div className="sticker bg-white px-4 py-3 animate-slide-up">
            <div className="text-[10px] font-extrabold tracking-widest text-cyber-pink">
              📍 SPOT LOCKED
            </div>
            <div className="mt-0.5 text-sm font-bold text-black">
              {locationName || `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Step 2: Message ─────────────────────────── */
function Step2Message({
  title,
  setTitle,
  body,
  setBody,
  onResetDraft,
}: {
  title: string;
  setTitle: (v: string) => void;
  body: string;
  setBody: (v: string) => void;
  onResetDraft: () => void;
}) {
  const hasDraft = title.length > 0 || body.length > 0;
  return (
    <div className="mx-auto max-w-md p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-3xl text-white">
          마음 적기 <span className="text-holo">✏️</span>
        </h2>
        {hasDraft && (
          <button
            type="button"
            onClick={onResetDraft}
            className="sticker !px-2.5 !py-1 bg-bg-soft text-[10px] font-extrabold tracking-widest text-white/70 hover:text-white"
            aria-label="임시 저장 초기화"
            title="입력 내용 지우기"
          >
            ↺ 초기화
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-white/60">한번 박제하면 못 지움.. ㄹㅇ 신중히</p>

      <div className="mt-6">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-xs font-extrabold tracking-widest text-cyber-pink">
            제목
          </label>
          <span className="text-[11px] font-bold text-white/50">
            {title.length}/20
          </span>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 20))}
          placeholder="이 스폿 찐임"
          className="sticker w-full bg-white px-4 py-3 text-base font-bold text-black placeholder:text-black/30 outline-none focus:bg-neon-yellow"
        />
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-xs font-extrabold tracking-widest text-cyber-pink">
            본문
          </label>
          <span className="text-[11px] font-bold text-white/50">
            {body.length}/200
          </span>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, 200))}
          placeholder="여기서 무슨 일이 있었는지.. ㄹㅇ 박제할 마음"
          rows={6}
          className="sticker w-full resize-none bg-white px-4 py-3 text-base font-medium text-black placeholder:text-black/30 outline-none focus:bg-neon-yellow"
        />
      </div>
    </div>
  );
}

/* ─────────────────────────── Step 3: Design ─────────────────────────── */
function Step3Design({
  color,
  setColor,
  shape,
  setShape,
}: {
  color: LockColor;
  setColor: (v: LockColor) => void;
  shape: LockShape;
  setShape: (v: LockShape) => void;
}) {
  const svg = buildLockSvg(color, shape, 140);
  const randomize = () => {
    setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setShape(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
  };
  return (
    <div className="mx-auto max-w-md p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-3xl text-white">
          스타일 <span className="text-holo">PICK 🎨</span>
        </h2>
        <button
          type="button"
          onClick={randomize}
          className="sticker !px-2.5 !py-1 bg-bg-soft text-[10px] font-extrabold tracking-widest text-white/80 hover:text-white"
          aria-label="컬러와 모양 무작위로"
          title="랜덤"
        >
          🎲 랜덤
        </button>
      </div>
      <p className="mt-1 text-sm text-white/60">취향대로 찍어</p>

      <div className="relative mt-5 flex justify-center py-6">
        <div
          className="bg-holo absolute inset-x-12 top-8 -z-0 h-32 rounded-full opacity-50 blur-3xl"
          aria-hidden
        />
        <div className="relative animate-pop-in" dangerouslySetInnerHTML={{ __html: svg }} />
      </div>

      <div className="mt-4">
        <div className="mb-2 text-xs font-extrabold tracking-widest text-cyber-pink">
          컬러
        </div>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={COLOR_LABEL[c]}
              className={`h-12 w-12 rounded-full border-[3px] border-black shadow-sticker transition-transform ${
                color === c
                  ? '-translate-y-1 ring-4 ring-white scale-110'
                  : 'hover:-translate-y-0.5'
              }`}
              style={{ background: COLOR_HEX[c] }}
            />
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 text-xs font-extrabold tracking-widest text-cyber-pink">
          모양
        </div>
        <div className="grid grid-cols-3 gap-3">
          {SHAPES.map((s) => (
            <button
              key={s}
              onClick={() => setShape(s)}
              className={`sticker-btn flex-col !py-3 ${
                shape === s ? 'bg-cyber-pink text-white' : 'bg-white text-black'
              }`}
            >
              <span
                className="block"
                dangerouslySetInnerHTML={{
                  __html: buildLockSvg(color, s, 36),
                }}
              />
              <span className="text-xs">{SHAPE_LABEL[s]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Step 4: Visibility ─────────────────────────── */
function Step4Visibility({
  visibility,
  setVisibility,
}: {
  visibility: LockVisibility;
  setVisibility: (v: LockVisibility) => void;
}) {
  const descs: Record<LockVisibility, { title: string; sub: string; bg: string }> = {
    public: {
      title: '오픈 — 다 같이 봄',
      sub: '지도에 박제, 누구나 발견 가능 ㄹㅇ',
      bg: 'bg-cyber-pink',
    },
    private: {
      title: '혼자만 — 내 일기',
      sub: '나만 보는 자물쇠. 시크릿 일기장 ㄱㄱ',
      bg: 'bg-chrome',
    },
    link: {
      title: '둘만의 — 링크로만',
      sub: '링크 받은 사람만 볼 수 있음. 커플·찐친 전용',
      bg: 'bg-cyber-blue',
    },
  };
  return (
    <div className="mx-auto max-w-md p-5">
      <h2 className="font-display text-3xl text-white">
        공개? 비공개? <span className="text-holo">🔐</span>
      </h2>
      <p className="mt-1 text-sm text-white/60">한번 정하면 못 바꿈 (ㄹㅇ)</p>

      <div className="mt-5 flex flex-col gap-3">
        {VISIBILITIES.map((v) => {
          const meta = VISIBILITY_META[v];
          const d = descs[v];
          const active = visibility === v;
          return (
            <button
              key={v}
              onClick={() => setVisibility(v)}
              className={`sticker block w-full p-4 text-left transition-all ${
                active
                  ? '-translate-y-0.5 -translate-x-0.5 shadow-sticker-lg bg-white'
                  : 'bg-white/95 hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-[3px] border-black text-xl ${d.bg}`}
                >
                  {meta.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-black">{d.title}</span>
                    <span className={`chip ${meta.pill}`}>{meta.tag}</span>
                  </div>
                  <div className="mt-0.5 text-xs font-medium text-black/65">
                    {d.sub}
                  </div>
                </div>
                <div
                  className={`mt-1 h-5 w-5 shrink-0 rounded-full border-[3px] border-black ${
                    active ? 'bg-cyber-pink' : 'bg-white'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 sticker bg-bg-soft p-3 text-center text-xs font-bold text-white/70">
        ⚠️ 박제하면 1분 안에만 지울 수 있어요. 그 뒤엔 ㄹㅇ 영원히 박제됨
      </div>
    </div>
  );
}

/* ─────────────────────────── Done: link share ─────────────────────────── */
function DoneLinkScreen({ token, onDone }: { token: string; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/locks/${token}` : '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="mx-auto max-w-md p-5">
      <div className="mt-6 text-center">
        <div className="font-display text-4xl text-holo">박제 완료 ✨</div>
        <div className="mt-2 text-sm text-white/70">링크 받은 사람만 볼 수 있음 🔗</div>
      </div>

      <div className="mt-6 sticker bg-white p-4">
        <div className="text-[10px] font-extrabold tracking-widest text-cyber-pink">
          🔗 SHARE LINK
        </div>
        <div className="mt-1 break-all text-sm font-bold text-black">{url}</div>
        <button onClick={copy} className="sticker-btn mt-3 w-full bg-cyber-pink text-white">
          {copied ? '복사됨 ✓' : '링크 복사 📋'}
        </button>
      </div>

      <button
        onClick={onDone}
        className="sticker-btn mt-4 w-full bg-white text-black"
      >
        지도로 ㄱㄱ
      </button>
    </div>
  );
}
