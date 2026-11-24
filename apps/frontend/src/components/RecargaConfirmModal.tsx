import { useEffect, useReducer, useRef, useState } from 'react';
import type { CatalogItem } from '../types/recarga.types';
import {
  formatarBRL,
  normalizarTelefone,
  telefoneValido,
} from '../utils/formatoMoedaTelefone';
import {
  submitReducer,
  estadoInicial,
  montarRechargeRequest,
} from '../utils/submitRecarga';
import {
  criarRecarga,
  RecargaError,
  mapearErroRecarga,
} from '../utils/recargaClient';

interface RecargaConfirmModalProps {
  isOpen: boolean;
  item: CatalogItem | null; // dados a confirmar; null quando fechado
  onClose: () => void; // cancelar/Esc/fechar sem efeito
  onSuccess?: (item: CatalogItem) => void; // notifica sucesso a quem abriu
}

// ids estaveis para associar label/titulo via aria-* (R3.1, R9.1).
const TITULO_ID = 'recarga-confirm-modal-titulo';
const PHONE_FIELD_ID = 'recarga-confirm-modal-telefone';
const PHONE_ERRO_ID = 'recarga-confirm-modal-telefone-erro';

// Mensagens de validacao do Phone_Field (R3.3, R3.4).
const MSG_TELEFONE_OBRIGATORIO = 'Informe o número de telefone.';
const MSG_TELEFONE_INVALIDO =
  'Número de telefone inválido. Use DDD + 9 + 8 dígitos (ex.: 11912345678).';

// Seletor dos elementos focaveis internos do modal (focus trap, R9.2).
const SELETOR_FOCAVEIS =
  'button:not([disabled]), input:not([disabled]), [href], select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal de confirmação de recarga (CHA-62), acessível e novo (não estende o
 * ConfirmDialog, por decisão Q5).
 *
 * - Renderiza `null` quando `!isOpen || !item` (R1.2).
 * - Exibe `name`, `formatarBRL(amountBRL)` e `coinsCost` como pontos (R2.1–R2.4).
 * - Coleta e valida o telefone (Phone_Rule) antes de disparar a recarga; em
 *   inválido/vazio mostra mensagem e não invoca o serviço (R3.3, R3.4, R4.1).
 * - Orquestra o Submit_State via `useReducer(submitReducer, ...)`: `submitting`
 *   desabilita os controles e troca o rótulo do confirmar (R5.1–R5.5);
 *   `success` mostra confirmação e chama `onSuccess` (R6.1, R6.2); `error`
 *   mantém aberto com controles habilitados e mensagem não vazia (R7.1–R7.3).
 * - Acessível: `role="dialog"`, `aria-modal`, `aria-labelledby`, focus trap,
 *   foco inicial no Phone_Field e Esc fora de `submitting` (R9.1–R9.5).
 */
export function RecargaConfirmModal({
  isOpen,
  item,
  onClose,
  onSuccess,
}: RecargaConfirmModalProps) {
  const [estado, dispatch] = useReducer(submitReducer, estadoInicial);
  const [phoneValue, setPhoneValue] = useState('');
  // Mensagem de validacao local do telefone (separada do erro de submit).
  const [erroTelefone, setErroTelefone] = useState<string | null>(null);

  // Guarda contra setState-after-unmount / resultados stale de async (R6.3).
  const ativoRef = useRef(true);
  // Refs para o container do modal e o Phone_Field (foco inicial + trap).
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);

  const aberto = isOpen && item !== null;

  // Marca o ciclo de vida para ignorar resultados async apos desmontar.
  useEffect(() => {
    ativoRef.current = true;
    return () => {
      ativoRef.current = false;
    };
  }, []);

  // Ao abrir: reseta o estado de submit, limpa telefone/validacao e move o
  // foco para o Phone_Field (R3.7, R9.3). Ao fechar: reseta (RESET) para que
  // uma reabertura comece limpa.
  useEffect(() => {
    if (aberto) {
      dispatch({ type: 'RESET' });
      setPhoneValue('');
      setErroTelefone(null);
      // Aguarda a renderizacao do input antes de focar.
      const id = window.setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 0);
      return () => window.clearTimeout(id);
    }
    dispatch({ type: 'RESET' });
    setPhoneValue('');
    setErroTelefone(null);
    return undefined;
  }, [aberto]);

  if (!aberto || item === null) return null;

  const submitting = estado.status === 'submitting';
  const sucesso = estado.status === 'success';
  const erroSubmit = estado.status === 'error' ? estado.mensagem : null;

  // Fecha o modal sem invocar o serviço (R4.3). Bloqueado durante submitting
  // (R4.4/R9.4: Esc não fecha enquanto envia; Cancel já fica desabilitado).
  function fechar() {
    if (submitting) return;
    onClose();
  }

  function handleAlterarTelefone(valor: string) {
    setPhoneValue(valor);
    // Remove a mensagem de validacao assim que o valor passa a ser valido (R3.6).
    if (erroTelefone && telefoneValido(valor)) {
      setErroTelefone(null);
    }
  }

  async function handleConfirmar() {
    // Guarda contra reenvio enquanto já está enviando (R5.4).
    if (submitting || sucesso) return;
    if (item === null) return;

    // Validacao do telefone: vazio/so espacos => obrigatorio; senao invalido
    // (R3.3, R3.4). Em ambos os casos NÃO invoca o serviço (R4.1).
    if (!telefoneValido(phoneValue)) {
      const semDigitos = normalizarTelefone(phoneValue).length === 0;
      setErroTelefone(
        semDigitos ? MSG_TELEFONE_OBRIGATORIO : MSG_TELEFONE_INVALIDO,
      );
      return;
    }

    setErroTelefone(null);
    // error -> submitting limpa a mensagem de erro anterior no reducer (R7.6).
    dispatch({ type: 'SUBMIT' });

    const itemAtual = item;
    try {
      await criarRecarga(montarRechargeRequest(itemAtual, phoneValue));
      if (!ativoRef.current) return;
      dispatch({ type: 'SUCCESS' });
      onSuccess?.(itemAtual);
    } catch (error) {
      if (!ativoRef.current) return;
      if (error instanceof RecargaError) {
        dispatch({
          type: 'ERROR',
          codigo: error.codigo,
          mensagem: mapearErroRecarga(error.codigo),
        });
        return;
      }
      // Falha inesperada (defensivo): erro genérico, nunca texto de sucesso.
      dispatch({
        type: 'ERROR',
        codigo: 'UNKNOWN',
        mensagem: mapearErroRecarga('UNKNOWN'),
      });
    }
  }

  // Esc fecha quando não está enviando (R4.4, R9.4); focus trap entre os
  // controles internos com Tab/Shift+Tab (R9.2).
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      fechar();
      return;
    }

    if (event.key !== 'Tab') return;

    const container = dialogRef.current;
    if (!container) return;

    const focaveis = Array.from(
      container.querySelectorAll<HTMLElement>(SELETOR_FOCAVEIS),
    );
    if (focaveis.length === 0) {
      event.preventDefault();
      return;
    }

    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    const ativoElemento = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (ativoElemento === primeiro || !container.contains(ativoElemento)) {
        event.preventDefault();
        ultimo.focus();
      }
    } else if (ativoElemento === ultimo || !container.contains(ativoElemento)) {
      event.preventDefault();
      primeiro.focus();
    }
  }

  return (
    <div
      onKeyDown={handleKeyDown}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(128, 128, 128, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        fontFamily: 'sans-serif',
        padding: 16,
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITULO_ID}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          width: '440px',
          maxWidth: '100%',
        }}
      >
        <h2 id={TITULO_ID} style={{ margin: 0, color: '#112288', fontSize: '20px' }}>
          Confirmar recarga
        </h2>

        {/* Dados da recarga a confirmar (R2.1–R2.4). */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p style={{ margin: 0, color: '#333', fontSize: '15px' }}>
            Item: <strong>{item.name}</strong>
          </p>
          <p style={{ margin: 0, color: '#333', fontSize: '15px' }}>
            Valor: <strong>{formatarBRL(item.amountBRL)}</strong>
          </p>
          <p style={{ margin: 0, color: '#333', fontSize: '15px' }}>
            Custo: <strong>{item.coinsCost} pontos</strong>
          </p>
        </div>

        {sucesso ? (
          // Confirmação de sucesso identificando a recarga concluída (R6.2).
          <p
            role="status"
            style={{ color: '#15803d', fontWeight: 600, margin: 0 }}
          >
            Recarga de {item.name} ({formatarBRL(item.amountBRL)}) solicitada com
            sucesso.
          </p>
        ) : (
          <>
            {/* Phone_Field com label associado por htmlFor (R3.1). */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                htmlFor={PHONE_FIELD_ID}
                style={{ color: '#333', fontSize: '14px', fontWeight: 600 }}
              >
                Número de telefone
              </label>
              <input
                id={PHONE_FIELD_ID}
                ref={phoneInputRef}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={phoneValue}
                disabled={submitting}
                aria-invalid={erroTelefone !== null}
                aria-describedby={erroTelefone ? PHONE_ERRO_ID : undefined}
                onChange={(e) => handleAlterarTelefone(e.target.value)}
                placeholder="DDD + número (ex.: 11912345678)"
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '15px',
                }}
              />
              {erroTelefone && (
                <p
                  id={PHONE_ERRO_ID}
                  style={{ color: '#b91c1c', fontWeight: 600, margin: 0, fontSize: '14px' }}
                >
                  {erroTelefone}
                </p>
              )}
            </div>

            {/* Erro de submit: mensagem não vazia, nunca texto de sucesso (R7.1–R7.3, R7.7). */}
            {erroSubmit && (
              <p role="alert" style={{ color: '#b91c1c', fontWeight: 600, margin: 0 }}>
                {erroSubmit}
              </p>
            )}
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          {sucesso ? (
            <button
              type="button"
              onClick={fechar}
              style={{
                padding: '10px 24px',
                backgroundColor: '#112288',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              Fechar
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={fechar}
                disabled={submitting}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#F0F0F0',
                  color: '#112288',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmar}
                disabled={submitting}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#112288',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Enviando...' : 'Confirmar recarga'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
