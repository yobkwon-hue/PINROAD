export type LockColor = 'red' | 'pink' | 'yellow' | 'sky' | 'purple';
export type LockShape = 'heart' | 'square' | 'circle';
export type LockVisibility = 'public' | 'private' | 'link';

export interface Lock {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  location_name: string | null;
  title: string;
  body: string;
  color: LockColor;
  shape: LockShape;
  visibility: LockVisibility;
  share_token: string | null;
  created_at: string;
}

// Y2K vivid palette — names kept identical to DB enum.
export const COLOR_HEX: Record<LockColor, string> = {
  red: '#FF2E5C',
  pink: '#FF2E93',
  yellow: '#FFE600',
  sky: '#00D9FF',
  purple: '#B026FF',
};

export const COLOR_LABEL: Record<LockColor, string> = {
  red: '레드',
  pink: '핑크',
  yellow: '옐로',
  sky: '시안',
  purple: '바이올렛',
};

export const SHAPE_LABEL: Record<LockShape, string> = {
  heart: '하트',
  square: '스퀘어',
  circle: '서클',
};

export const VISIBILITY_META: Record<
  LockVisibility,
  { label: string; tag: string; icon: string; pill: string }
> = {
  public: {
    label: '오픈',
    tag: 'OPEN',
    icon: '🌍',
    pill: 'bg-cyber-pink',
  },
  private: {
    label: '혼자만',
    tag: 'SOLO',
    icon: '🔒',
    pill: 'bg-chrome',
  },
  link: {
    label: '둘만의',
    tag: 'LINK',
    icon: '🔗',
    pill: 'bg-cyber-blue',
  },
};
