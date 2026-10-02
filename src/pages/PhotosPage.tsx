import { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { endpoints } from '../api/endpoints';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import { useFetch } from '../hooks/useFetch';
import type { Photo } from '../types';
import { simulateHeavyRender } from '../utils/simulateHeavyRender';

const ALBUM_IDS = Array.from({ length: 100 }, (_, i) => i + 1);

const ROW_HEIGHT = 56;

const titleCollator = new Intl.Collator();

type PhotoRowProps = {
  photo: Photo;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
};

const PhotoRow = memo(function PhotoRow({ photo, isFavorite, onToggleFavorite }: PhotoRowProps) {
  simulateHeavyRender();

  return (
    <div className="photo-row">
      <span className="photo-row__id">#{photo.id}</span>
      <span className="photo-row__title">{photo.title}</span>
      <span className="muted">Альбом {photo.albumId}</span>
      <button type="button" className="button" onClick={() => onToggleFavorite(photo.id)}>
        {isFavorite ? 'Убрать' : 'В избранное'}
      </button>
    </div>
  );
});

function SecondsOnPage() {
  const [secondsOnPage, setSecondsOnPage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSecondsOnPage(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return <p className="muted">Вы на странице {secondsOnPage} с</p>;
}

type PhotoListProps = {
  photos: Photo[];
  favorites: Set<number>;
  onToggleFavorite: (id: number) => void;
};

const PhotoList = memo(function PhotoList({ photos, favorites, onToggleFavorite }: PhotoListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: photos.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
    getItemKey: index => photos[index].id,
  });

  return (
    <div ref={scrollRef} className="photo-list">
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map(item => {
          const photo = photos[item.index];
          return (
            <div
              key={item.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: item.size,
                transform: `translateY(${item.start}px)`,
              }}
            >
              <PhotoRow
                photo={photo}
                isFavorite={favorites.has(photo.id)}
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default function PhotosPage() {
  const { data: photos, isLoading, error, refetch } = useFetch<Photo[]>(endpoints.photos);

  const [query, setQuery] = useState('');
  const [albumId, setAlbumId] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [favorites, setFavorites] = useState<Set<number>>(() => new Set());

  const deferredQuery = useDeferredValue(query);

  const sortedPhotos = useMemo(() => {
    return [...(photos ?? [])].sort((a, b) =>
      sortOrder === 'asc'
        ? titleCollator.compare(a.title, b.title)
        : titleCollator.compare(b.title, a.title)
    );
  }, [photos, sortOrder]);

  const visiblePhotos = useMemo(() => {
    const normalizedQuery = deferredQuery.toLowerCase();
    const album = albumId === 'all' ? null : Number(albumId);
    return sortedPhotos.filter(
      photo =>
        (album === null || photo.albumId === album) &&
        photo.title.toLowerCase().includes(normalizedQuery)
    );
  }, [sortedPhotos, albumId, deferredQuery]);

  const handleToggleFavorite = useCallback((id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  if (isLoading) return <Loader text="Загружаем медиатеку..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <section>
      <h1>Медиатека</h1>
      <SecondsOnPage />

      <div className="toolbar">
        <input
          className="input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Поиск по названию"
        />
        <select className="input" value={albumId} onChange={e => setAlbumId(e.target.value)}>
          <option value="all">Все альбомы</option>
          {ALBUM_IDS.map(id => (
            <option key={id} value={id}>
              Альбом {id}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
        >
          <option value="asc">А–Я</option>
          <option value="desc">Я–А</option>
        </select>
      </div>

      <p>
        Показано: {visiblePhotos.length} из {photos?.length ?? 0}. В избранном: {favorites.size}
      </p>

      <PhotoList
        photos={visiblePhotos}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
      />
    </section>
  );
}
