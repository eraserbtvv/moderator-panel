import { useState } from 'react';
import { endpoints, POSTS_PER_PAGE } from '../api/endpoints';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import { Pagination } from '../components/Pagination';
import { PostCard } from '../components/PostCard';
import { useDebounce } from '../hooks/useDebounce';
import { useFetch } from '../hooks/useFetch';
import type { Post } from '../types';

export default function PostsPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const debouncedQuery = useDebounce(query, 500);
  const isTyping = query !== debouncedQuery;

  const [searchedQuery, setSearchedQuery] = useState(debouncedQuery);
  if (searchedQuery !== debouncedQuery) {
    setSearchedQuery(debouncedQuery);
    setPage(1);
  }

  const {
    data: posts,
    isLoading,
    error,
    refetch,
  } = useFetch<Post[]>(endpoints.posts({ page, query: debouncedQuery }));

  function renderContent() {
    if (isTyping) return <Loader text="Печатаете..." />;
    if (isLoading) return <Loader text="Загружаем посты..." />;
    if (error) return <ErrorMessage message={error} onRetry={refetch} />;
    if (!posts || posts.length === 0) return <EmptyState text="Ничего не найдено" />;

    return (
      <ul className="list">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </ul>
    );
  }

  const hasNext = posts !== null && posts.length === POSTS_PER_PAGE;

  return (
    <section>
      <h1>Посты</h1>

      <input
        className="input"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Поиск по заголовку и тексту"
      />

      {renderContent()}

      <Pagination page={page} hasNext={hasNext} isDisabled={isLoading} onChange={setPage} />
    </section>
  );
}
