import { useState, useEffect } from 'react';
import { QuestionCard } from './QuestionCard';
import { theme } from '../utils/colors';

interface QuestionGridProps {
  filtrosAtivos: string[];
}

interface QuestaoDB {
    id: number;
    dificuldade: string;
    enunciado: string;
    alternativas: string[];
}

export function QuestionGrid({ filtrosAtivos }: QuestionGridProps) {
    const [bancoDeQuestoes, setBancoDeQuestoes] = useState<QuestaoDB[]>([]);
    const [carregando, setCarregando] = useState(true); 

    useEffect(() => {
        fetch('http://localhost:3000/api/questoes')
        .then(resposta => resposta.json())
        .then(dadosDaApi => {
            console.log("RESPOSTA DO BACKEND:", dadosDaApi);
            setBancoDeQuestoes(dadosDaApi);
            setCarregando(false);
        })
        .catch(erro => {
            console.error("Erro ao buscar questões:", erro);
            setCarregando(false);
        });
    }, []);

    const questoesFiltradas = bancoDeQuestoes.filter(questao => {
        if (filtrosAtivos.length === 0) return true;
        return filtrosAtivos.includes(questao.dificuldade);
    });

    return (
        <div style={{ padding: '1rem', background: theme.background.grid, borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0, color: theme.text.title }}>Questões Cadastradas</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>
            
            {carregando ? (
            <p style={{ color: theme.text.body }}>Carregando questões do banco de dados...</p>
            ) : questoesFiltradas.length > 0 ? (
            questoesFiltradas.map(questao => (
                <QuestionCard 
                key={questao.id}
                dificuldade={questao.dificuldade} 
                enunciado={questao.enunciado} 
                alternativas={questao.alternativas} 
                />
            ))
            ) : (
            <p style={{ color: theme.text.body, fontStyle: 'italic' }}>
                Nenhuma questão encontrada para este filtro.
            </p>
            )}

        </div>
        </div>
    );
}