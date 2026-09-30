import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { endpoints } from '../api/endpoints';
import { AuthorBadge } from '../components/AuthorBadge';
import { CommentForm } from '../components/CommentForm';
import { CommentList } from '../components/CommentList';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import { useFetch } from '../hooks/useFetch';
import type { Comment, Post } from '../types';

export default function PostPage() {
  const { postId = '' } = useParams();

  const {
    data: post,
    isLoading: isPostLoading,
    error: postError,
    status: postStatus,
    refetch: refetchPost,
  } = useFetch<Post>(endpoints.post(postId));

  const {
    data: comments,
    isLoading: areCommentsLoading,
    error: commentsError,
    refetch: refetchComments,
  } = useFetch<Comment[]>(endpoints.postComments(postId));

  // jsonplaceholder не сохраняет комментарии, поэтому созданные храним локально
  const [createdComments, setCreatedComments] = useState<Comment[]>([]);
  const ownComments = createdComments.filter(comment => String(comment.postId) === postId);

  function handleCommentCreated(comment: Comment) {
    // Сервер всегда возвращает id: 501 -- заменяем, чтобы key не повторялся
    setCreatedComments(prev => [...prev, { ...comment, id: Date.now() }]);
  }

  const backLink = (
    <Link to="/posts" className="back-link">
      ← К списку постов
    </Link>
  );

  if (isPostLoading) {
    return (
      <section>
        {backLink}
        <Loader text="Загружаем пост..." />
      </section>
    );
  }

  if (postStatus === 404) {
    return (
      <section>
        <h1>Пост не найден</h1>
        <p>
          Поста #{postId} не существует. Вернитесь к <Link to="/posts">списку постов</Link>.
        </p>
      </section>
    );
  }

  if (postError || !post) {
    return (
      <section>
        {backLink}
        <ErrorMessage message={postError ?? 'Пост не загрузился'} onRetry={refetchPost} />
      </section>
    );
  }

  function renderComments() {
    if (areCommentsLoading) return <Loader text="Загружаем комментарии..." />;
    if (commentsError) {
      return (
        <>
          <ErrorMessage message={commentsError} onRetry={refetchComments} />
          {ownComments.length > 0 && <CommentList comments={ownComments} />}
        </>
      );
    }
    return <CommentList comments={[...(comments ?? []), ...ownComments]} />;
  }

  return (
    <section>
      {backLink}
      <article>
        <h1>{post.title}</h1>
        <AuthorBadge userId={post.userId} />
        <p className="card__text">{post.body}</p>
      </article>

      <h2>Комментарии</h2>
      {renderComments()}

      <CommentForm postId={post.id} onCreated={handleCommentCreated} />
    </section>
  );
}
