import { endpoints } from '../api/endpoints';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import { useFetch } from '../hooks/useFetch';
import type { User } from '../types';

export default function UsersPage() {
  const { data: users, isLoading, error, refetch } = useFetch<User[]>(endpoints.users);

  if (isLoading) return <Loader text="Загружаем авторов..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (!users || users.length === 0) return <EmptyState text="Авторов нет" />;

  return (
    <section>
      <h1>Авторы</h1>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Логин</th>
              <th>Email</th>
              <th>Город</th>
              <th>Компания</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.address.city}</td>
                <td>{user.company.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
