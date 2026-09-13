import { Request, Response } from 'express';
import { simuladoService } from '../services/simulado.service';

// ---------------------------------------------------------------------------
//   1. lê e valida o que veio na requisição (query params, body, params)
//   2. chama o service
//   3. transforma o resultado em uma resposta HTTP
// ---------------------------------------------------------------------------

function getId(req: Request) {
 // O Express pode tipar o parâmetro como string ou string[], mas esta rota usa um único ID.
 return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
}

function isNotFoundError(error: unknown) {
 // Converte o erro de domínio do service em uma resposta HTTP 404.
 return error instanceof Error && error.message === 'Simulado não encontrado';
}

export async function createSimulado(req: Request, res: Response) {
 // O middleware de validação já garantiu o formato do payload antes deste ponto.
 const simulado = await simuladoService.createSimulado(req.body);
 return res.status(201).json(simulado);
}

export async function updateSimulado(req: Request, res: Response) {
 // O service verifica a existência antes de delegar a atualização ao repository.
 try {
  const simulado = await simuladoService.updateSimulado(getId(req), req.body);
  return res.status(200).json(simulado);
 } catch (error) {
  if (isNotFoundError(error)) {
   return res.status(404).json({ error: 'Simulado não encontrado' });
  }

  return res.status(500).json({ error: 'Erro ao atualizar simulado' });
 }
}

export async function deleteSimulado(req: Request, res: Response) {
 // Retorna 204 quando a exclusão física é concluída sem conteúdo na resposta.
 try {
  await simuladoService.deleteSimulado(getId(req));
  return res.status(204).send();
 } catch (error) {
  if (isNotFoundError(error)) {
   return res.status(404).json({ error: 'Simulado não encontrado' });
  }

  return res.status(500).json({ error: 'Erro ao remover simulado' });
 }
}