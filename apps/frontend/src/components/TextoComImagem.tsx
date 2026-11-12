// Renderiza um texto que pode conter imagens em markdown: ![alt](url).
// As questões do banco guardam enunciados e alternativas nesse formato.
// Trocamos cada marcação de imagem por uma <img> de verdade e mantemos o texto ao redor como está. (Se a questão não tiver imagem, ele mantém o texto como está, sem alterações.)

const IMG_MARKDOWN = /!\[([^\]]*)\]\(([^)\s]+)\)/g;

type TextoComImagemProps = {
  conteudo: string;
  className?: string;
};

export function TextoComImagem({ conteudo, className }: TextoComImagemProps) {
  const partes: Array<string | { alt: string; src: string }> = [];
  let ultimoIndice = 0;

  for (const match of conteudo.matchAll(IMG_MARKDOWN)) {
    const indice = match.index ?? 0;
    if (indice > ultimoIndice) {
      partes.push(conteudo.slice(ultimoIndice, indice));
    }
    partes.push({ alt: match[1], src: match[2] });
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
