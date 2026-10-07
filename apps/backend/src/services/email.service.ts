const escapeHtml = (s: string) =>
	s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export async function sendVerificationEmail(to: string, name: string, token: string) {
	const link = `${process.env.FRONTEND_URL}/verificar-email?token=${token}`;

	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: process.env.EMAIL_FROM,
			to,
			subject: 'Confirme seu e-mail - Revoada Digital',
			html: `
				<p>Olá, ${escapeHtml(name)}!</p>
				<p>Clique no botão abaixo para confirmar seu e-mail:</p>
				<p><a href="${link}" style="padding:12px 20px;background:#183189;color:#fff;border-radius:6px;text-decoration:none">Confirmar e-mail</a></p>
				<p>Ou copie este link: ${link}</p>
				<p>Ele expira em 24 horas.</p>
			`,
		}),
	});

	if (!res.ok) {
		throw new Error(`Falha ao enviar e-mail (${res.status}): ${await res.text()}`);
	}
}