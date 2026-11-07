// Servico de envio de email via Resend (API REST, sem SDK).
// Estrategia (Opcao 3): envia de verdade quando o Resend aceita o destinatario;
// se falhar (ex.: dominio nao verificado, destinatario nao permitido no modo teste),
// faz fallback logando o link no console, para o fluxo nunca travar.

const RESEND_API_URL = 'https://api.resend.com/emails';

type SendResult = { sent: boolean; fallback: boolean; error?: string };

export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? 'Revoada Digital <onboarding@resend.dev>';

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Confirme seu email</h2>
      <p>Bem-vindo(a) à Revoada Digital! Para ativar sua conta, confirme seu email.</p>
      <p>
        <a href="${verifyUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;">
          Confirmar email
        </a>
      </p>
      <p>Ou abra este link no navegador:</p>
      <p style="word-break:break-all;color:#555;">${verifyUrl}</p>
      <p style="color:#888;font-size:12px;">Este link expira em 24 horas.</p>
    </div>
  `;

  // Sem chave configurada: cai direto no fallback.
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY ausente. Link de confirmacao (fallback):', verifyUrl);
    return { sent: false, fallback: true, error: 'RESEND_API_KEY ausente' };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: 'Confirme seu email - Revoada Digital',
        html,
      }),
    });

    if (!response.ok) {
      const detalhe = await response.text().catch(() => '');
      console.warn(
        `[email] Resend recusou o envio para ${to} (status ${response.status}). ` +
        `Link de confirmacao (fallback): ${verifyUrl}. Detalhe: ${detalhe}`
      );
      return { sent: false, fallback: true, error: `Resend status ${response.status}` };
    }

    console.info(`[email] Email de confirmacao enviado para ${to}.`);
    return { sent: true, fallback: false };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'erro desconhecido';
    console.warn(`[email] Falha ao enviar para ${to}: ${msg}. Link (fallback): ${verifyUrl}`);
    return { sent: false, fallback: true, error: msg };
  }
}