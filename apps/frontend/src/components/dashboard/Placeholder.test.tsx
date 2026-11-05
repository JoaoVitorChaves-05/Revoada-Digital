// Testes de exemplo do componente Placeholder (R18.2).
// Cobrem a marcação visual (selo "em breve" / rótulo customizado), a marcação
// programática (data-placeholder) e a acessibilidade (aria-label), além da
// estrutura "fantasma" via children.
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Placeholder } from './Placeholder';

describe('Placeholder', () => {
  it('renderiza o selo textual "em breve" por padrão', () => {
    render(<Placeholder />);

    expect(screen.getByText('em breve')).toBeInTheDocument();
  });

  it('aplica data-placeholder="true" no elemento raiz', () => {
    const { container } = render(<Placeholder />);

    const raiz = container.querySelector('.placeholder');
    expect(raiz).not.toBeNull();
    expect(raiz).toHaveAttribute('data-placeholder', 'true');
  });

  it('usa descricaoAcessivel como aria-label quando fornecida', () => {
    const descricao = 'Tempo de estudo disponível em breve';
    const { container } = render(<Placeholder descricaoAcessivel={descricao} />);

    const raiz = container.querySelector('.placeholder');
    expect(raiz).toHaveAttribute('aria-label', descricao);
    // E localizável por papel/rótulo acessível.
    expect(screen.getByLabelText(descricao)).toBe(raiz);
  });

  it('exibe o rótulo customizado quando rotulo é passado', () => {
    render(<Placeholder rotulo="novidade" />);

    expect(screen.getByText('novidade')).toBeInTheDocument();
    expect(screen.queryByText('em breve')).not.toBeInTheDocument();
  });

  it('renderiza children (estrutura fantasma) quando fornecido', () => {
    render(
      <Placeholder>
        <span data-testid="barra-fantasma">barras cinza</span>
      </Placeholder>,
    );

    expect(screen.getByTestId('barra-fantasma')).toBeInTheDocument();
    expect(screen.getByText('barras cinza')).toBeInTheDocument();
  });
});
