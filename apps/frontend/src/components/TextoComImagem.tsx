// Renderiza um texto que pode conter imagens, em dois formatos:
//   1) markdown: ![alt](url)
//   2) link puro de imagem: https://.../figura.png
// As questões do banco guardam enunciados e alternativas de ambas as formas.
// Trocamos cada imagem por uma <img> de verdade e mantemos o texto ao redor
// como está. (Se não houver imagem, o texto fica igual, sem alterações.)

// Casa markdown ![alt](url) OU uma URL http(s) que termina em extensão de imagem.
// Os grupos: markdown => [1]=alt [2]=url; link puro => [3]=url.
const IMG_PATTERN =
  /!\[([^\]]*)\]\(([^)\s]+)\)|(https?:\/\/[^\s)]+\.(?:png|jpe?g|gif|webp|svg)(?:\?[^\s)]*)?)/gi;

type TextoComImagemProps = {
  conteudo: string;
  className?: string;
};

export function TextoComImagem({ conteudo, className }: TextoComImagemProps) {
  const partes: Array<string | { alt: string; src: string }> = [];
  let ultimoIndice = 0;

  for (const match of conteudo.matchAll(IMG_PATTERN)) {
    const indice = match.index ?? 0;
    if (indice > ultimoIndice) {
      partes.push(conteudo.slice(ultimoIndice, indice));
    }
    // match[2] = url do markdown; match[3] = url do link puro.
    const src = match[2] ?? match[3] ?? '';
    const alt = match[1] ?? '';
    partes.push({ alt, src });
    ultimoIndice = indice + match[0].length;
  }

  if (ultimoIndice < conteudo.length) {
    partes.push(conteudo.slice(ultimoIndice));
  }

  return (
    <span className={className}>
      {partes.map((parte, i) =>
        typeof parte === 'string' ? (
          <span key={i}>{parte}</span>
        ) : (
          <img
            key={i}
            src={parte.src}
            alt={parte.alt || 'Imagem da questão'}
            style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '8px 0' }}
          />
        )
      )}
    </span>
  );
}
