import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { IconPlay } from './icons';

export interface AudioTrack {
  dialect: string;
  src: string;
}

export interface AudioPlayerProps {
  tracks?: AudioTrack[];
  src?: string;
  dialect?: string;
  initialDialect?: string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

const BAR_WIDTH = 2;
const BAR_GAP = 4;
const STEP = BAR_WIDTH + BAR_GAP;

const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const hashSeed = (input: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
};

const barHeight = (seed: number, i: number, count: number): number => {
  const t = (seed * (i + 1) * 2654435761) >>> 0;
  const r = (t % 1000) / 1000;
  const middle = Math.sin((i / Math.max(1, count - 1)) * Math.PI);
  return Math.max(0.18, Math.min(1, 0.22 + r * 0.78 * (0.4 + middle * 0.6)));
};

const IconPause = ({ size = 16, color }: { size?: number; color?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color || 'currentColor'}
    aria-hidden="true"
  >
    <rect x="6" y="4.5" width="4" height="15" rx="1" />
    <rect x="14" y="4.5" width="4" height="15" rx="1" />
  </svg>
);

const IconChevron = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const AudioPlayer = ({
  tracks,
  src,
  dialect,
  initialDialect,
  disabled = false,
  ariaLabel,
  className,
  style,
}: AudioPlayerProps) => {
  const normalizedTracks = useMemo<AudioTrack[]>(() => {
    if (tracks && tracks.length > 0) return tracks.filter((t) => t.src);
    if (src) return [{ dialect: dialect || 'Default', src }];
    return [];
  }, [tracks, src, dialect]);

  const isDisabled = disabled || normalizedTracks.length === 0;

  const [selectedDialect, setSelectedDialect] = useState<string>(
    () =>
      (initialDialect &&
        normalizedTracks.find((t) => t.dialect === initialDialect)?.dialect) ||
      normalizedTracks[0]?.dialect ||
      '',
  );

  useEffect(() => {
    if (
      normalizedTracks.length > 0 &&
      !normalizedTracks.find((t) => t.dialect === selectedDialect)
    ) {
      setSelectedDialect(normalizedTracks[0].dialect);
    }
  }, [normalizedTracks, selectedDialect]);

  const currentTrack =
    normalizedTracks.find((t) => t.dialect === selectedDialect) ||
    normalizedTracks[0];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [currentTrack?.src]);

  const handlePlayPause = useCallback(() => {
    if (isDisabled || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [isDisabled, isPlaying]);

  const waveformRef = useRef<HTMLDivElement | null>(null);
  const [barCount, setBarCount] = useState(48);

  useLayoutEffect(() => {
    const el = waveformRef.current;
    if (!el) return;
    const update = () => {
      const width = el.clientWidth;
      const next = Math.max(8, Math.floor((width + BAR_GAP) / STEP));
      setBarCount(next);
    };
    update();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const seed = useMemo(
    () => hashSeed(currentTrack?.src || 'kurukh-empty-waveform'),
    [currentTrack?.src],
  );

  const heights = useMemo(
    () => Array.from({ length: barCount }, (_, i) => barHeight(seed, i, barCount)),
    [seed, barCount],
  );

  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;
  const playedBars = Math.round(progress * barCount);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDisabled || !audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * duration;
    setCurrentTime(pct * duration);
  };

  return (
    <div
      className={`flex items-center gap-3 sm:gap-4 w-full ${className || ''}`}
      style={{
        background: 'var(--kd-surface-alt)',
        border: '1px solid var(--kd-line-soft)',
        borderRadius: 16,
        padding: '12px 14px',
        opacity: isDisabled ? 0.55 : 1,
        ...style,
      }}
      aria-label={
        ariaLabel ||
        (isDisabled ? 'Audio pronunciation unavailable' : 'Audio pronunciation')
      }
    >
      <button
        type="button"
        onClick={handlePlayPause}
        disabled={isDisabled}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className="inline-flex items-center justify-center shrink-0 transition-opacity"
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: isDisabled ? 'var(--kd-ink-mute)' : 'var(--kd-accent)',
          color: '#FBF7EE',
          border: 'none',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          padding: 0,
        }}
      >
        {isPlaying ? (
          <IconPause size={16} color="#FBF7EE" />
        ) : (
          <IconPlay size={16} color="#FBF7EE" />
        )}
      </button>

      <div
        ref={waveformRef}
        role={isDisabled ? undefined : 'slider'}
        aria-valuemin={0}
        aria-valuemax={Math.max(1, Math.floor(duration))}
        aria-valuenow={Math.floor(currentTime)}
        aria-disabled={isDisabled || undefined}
        onClick={handleSeek}
        className="flex items-center min-w-0 flex-1"
        style={{
          height: 40,
          gap: BAR_GAP,
          cursor: isDisabled || !duration ? 'default' : 'pointer',
          overflow: 'hidden',
        }}
      >
        {heights.map((h, i) => {
          const played = i < playedBars;
          return (
            <span
              key={i}
              aria-hidden="true"
              style={{
                width: BAR_WIDTH,
                height: `${Math.round(h * 100)}%`,
                background: isDisabled
                  ? 'var(--kd-ink-mute)'
                  : played
                    ? 'var(--kd-accent)'
                    : 'color-mix(in srgb, var(--kd-ink-mute) 55%, transparent)',
                borderRadius: 1,
                flex: '0 0 auto',
                transition: 'background 80ms linear',
              }}
            />
          );
        })}
      </div>

      <div
        className="kd-font-mono shrink-0 hidden sm:block"
        style={{
          fontSize: 13,
          color: 'var(--kd-ink-soft)',
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
        }}
      >
        {isDisabled
          ? '—:—  /  —:—'
          : `${formatTime(currentTime)} / ${formatTime(duration)}`}
      </div>

      {normalizedTracks.length > 0 && (
        <div className="hidden md:flex flex-col items-start shrink-0">
          <span
            className="kd-font-mono"
            style={{
              fontSize: 10.5,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--kd-ink-mute)',
              marginBottom: 2,
            }}
          >
            Dialect
          </span>
          <div className="relative inline-flex items-center">
            <select
              disabled={isDisabled || normalizedTracks.length < 2}
              value={selectedDialect}
              onChange={(e) => setSelectedDialect(e.target.value)}
              className="kd-font-sans appearance-none"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--kd-ink)',
                fontSize: 14,
                fontWeight: 600,
                paddingRight: 18,
                cursor:
                  isDisabled || normalizedTracks.length < 2
                    ? 'default'
                    : 'pointer',
              }}
            >
              {normalizedTracks.map((t) => (
                <option key={t.dialect} value={t.dialect}>
                  {t.dialect}
                </option>
              ))}
            </select>
            {normalizedTracks.length >= 2 && !isDisabled && (
              <span
                aria-hidden="true"
                className="absolute right-0 pointer-events-none"
                style={{ color: 'var(--kd-ink-soft)', top: 3 }}
              >
                <IconChevron size={14} />
              </span>
            )}
          </div>
        </div>
      )}

      {currentTrack?.src && (
        <audio
          ref={audioRef}
          src={currentTrack.src}
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
          onTimeUpdate={(e) =>
            setCurrentTime((e.target as HTMLAudioElement).currentTime)
          }
          onLoadedMetadata={(e) => {
            const d = (e.target as HTMLAudioElement).duration;
            if (isFinite(d)) setDuration(d);
          }}
        />
      )}
    </div>
  );
};

export default AudioPlayer;
