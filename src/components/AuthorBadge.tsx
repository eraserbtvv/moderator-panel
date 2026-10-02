import { endpoints } from '../api/endpoints';
import { useFetch } from '../hooks/useFetch';
import type { User } from '../types';

type AuthorBadgeProps = {
  userId: number;
};

export function AuthorBadge({ userId }: AuthorBadgeProps) {
  const { data: user, isLoading, error } = useFetch<User>(endpoints.user(userId));

  if (isLoading) return <p className="muted">Загружаем автора...</p>;
  if (error || !user) return <p className="muted">Автор неизвестен</p>;

  return (
    <p className="muted">
      Автор: <strong>{user.name}</strong> ({user.email})
    </p>
  );
}
