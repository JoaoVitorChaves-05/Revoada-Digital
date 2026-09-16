export function DashboardAdmin(){
    return (
        <div style = {{padding: '20px'}}>
            <h1>Dashboard do Administrador</h1>
            <p>Visão Geral do Sistema em Tempo real</p>
            <div style = {{display: 'flex', gap: '20px', marginTop: '20px'}}>
                <div style = {{border: 'lpx solid black', padding: '10px'}}>
                    <h3>Usuários Online</h3>
                    <h2>42</h2>
                </div>
            </div>
        </div>
    )
}