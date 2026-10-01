import { QuestionCard } from './QuestionCard';

export function QuestionGrid() {
    return (
        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>Questões Cadastradas</h3>
        
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '24px',
            marginTop: '16px'
        }}>
            <QuestionCard 
            dificuldade="Difícil" 
            enunciado="Qual é o valor de X na equação 2x + 4 = 10?" 
            alternativas = {['1', '2', '3', '4']} 
            />
            
            <QuestionCard  
            dificuldade="Fácil" 
            enunciado="Quem descobriu o Brasil?" 
            alternativas = {['Pedro Álvares Cabral', 'Vasco da Gama', 'Cristóvão Colombo', 'Tiradentes']} 
            />

            <QuestionCard 
            dificuldade="Média" 
            enunciado="O que significa a sigla HTML?" 
            alternativas = {['Hyper Text Markup Language', 'High Tech Machine Learning', 'Hyper Tool Multi Language']} 
            />
        </div>
        </div>
    );
}