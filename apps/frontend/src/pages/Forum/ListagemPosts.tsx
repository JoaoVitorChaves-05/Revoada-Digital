import { useState } from 'react';
import './ListagemPosts.css';

// Tipagem dos dados do post
interface Post {
  id: string;
  title: string;
  author: string;
  date: string;
  replies: number;
}

// Simulando os posts que virão do Backend no futuro
const mockPosts: Post[] = [
  { id: '1', title: 'Dúvida na fórmula de Juros Compostos', author: 'Ana Silva', date: '07 Out 2026', replies: 3 },
  { id: '2', title: 'Como resolver matrizes mais rápido?', author: 'João Souza', date: '06 Out 2026', replies: 12 },
  { id: '3', title: 'Resumo sobre Funções Afins', author: 'Maria Clara', date: '05 Out 2026', replies: 0 },
  { id: '4', title: 'Geometria Espacial: Volume do Cilindro', author: 'Pedro Santos', date: '02 Out 2026', replies: 5 },
  { id: '5', title: 'Dica para Análise Combinatória', author: 'Luiza Dugois', date: '01 Out 2026', replies: 28 },
];

export function ListagemPosts() {
  const [materiaAtual] = useState('Matemática e suas Tecnologias');

  return (
    <div className="forum-container">
      <header className="forum-header">
        <div className="logo-container">
          <span className="logo-revoada">Revoada</span>
          <span className="logo-digital">Digital</span>
        </div>
        <nav className="header-nav">
          <a href="#inicio">Início</a>
          <a href="#disciplinas">Disciplinas</a>
          <a href="#simulados">Simulados</a>
          <a href="#forum" className="ativo">Fórum</a>
        </nav>
      </header>

      <main className="forum-main">
        <div className="forum-cabecalho">
          <div>
            <h1 className="forum-titulo">Fórum de Dúvidas</h1>
            <p className="forum-subtitulo">Matéria atual: <strong>{materiaAtual}</strong></p>
          </div>
          <button className="btn-novo-post">+ Novo Post</button>
        </div>

        <div className="posts-grid">
          {mockPosts.map((post) => (
            <div key={post.id} className="post-card">
              <h3 className="post-titulo">{post.title}</h3>
              
              <div className="post-infos">
                <div className="info-item">
                  <span className="info-label">Autor:</span>
                  <span className="info-valor">{post.author}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Data:</span>
                  <span className="info-valor">{post.date}</span>
                </div>
              </div>

              <div className="post-rodape">
                <span className={`badge-respostas ${post.replies === 0 ? 'sem-resposta' : ''}`}>
                  {post.replies} {post.replies === 1 ? 'resposta' : 'respostas'}
                </span>
                <button className="btn-ler-mais">Ler discussão ➔</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}