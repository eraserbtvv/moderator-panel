import { useState, type FormEvent } from 'react';
import { endpoints } from '../api/endpoints';
import { useMutation } from '../hooks/useMutation';
import type { Comment } from '../types';

type CommentFormProps = {
  postId: number;
  onCreated: (comment: Comment) => void;
};

export function CommentForm({ postId, onCreated }: CommentFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');

  const { isLoading, error, execute } = useMutation<Comment>(endpoints.comments);

  const isValid = name.trim() !== '' && email.trim() !== '' && body.trim() !== '';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid || isLoading) return;

    const comment = await execute({ postId, name, email, body });
    if (!comment) return;

    onCreated(comment);
    setName('');
    setEmail('');
    setBody('');
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3>Новый комментарий</h3>
      <input
        className="input"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Тема"
      />
      <input
        className="input"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
      />
      <textarea
        className="input"
        rows={3}
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Текст комментария"
      />
      <button type="submit" className="button" disabled={!isValid || isLoading}>
        {isLoading ? 'Отправка...' : 'Отправить'}
      </button>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
