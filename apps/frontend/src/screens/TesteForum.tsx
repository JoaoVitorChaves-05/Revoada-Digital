import { useForumPosts } from '../hooks/useForum';
import { SUBJECT_LABELS } from '../types/forum.types';

export default function TesteForum() {
  const { posts, loading, error } = useForumPosts();

  if (loading) return <div style={{padding: '20px'}}>Carregando...</div>;
  if (error) return <div style={{padding: '20px', color: 'red'}}>Erro: {error}</div>;

  return (
    <div style={{padding: '20px'}}>
      <h1>Teste de Integração - Posts do Fórum</h1>
      <p>Total de posts: {posts.length}</p>
      {posts.map(post => (
        <div key={post.id} style={{border: '1px solid #ccc', padding: '10px', margin: '10px 0'}}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <small>Matéria: {SUBJECT_LABELS[post.subject]}</small>
          <br />
          <small>Autor: {post.author.full_name}</small>
        </div>
      ))}
    </div>
  );
}
