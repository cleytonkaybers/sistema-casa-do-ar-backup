import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      return Response.json({ error: 'Credenciais Twilio não configuradas' }, { status: 500 });
    }

    // Data de hoje no formato YYYY-MM-DD (horário de Manaus UTC-4)
    const hoje = new Date();
    hoje.setHours(hoje.getHours() - 4); // UTC -> America/Manaus
    const hojeStr = hoje.toISOString().split('T')[0];

    // Buscar clientes com preventiva para hoje
    const clientes = await base44.asServiceRole.entities.Cliente.filter({
      proxima_manutencao: hojeStr
    });

    if (!clientes || clientes.length === 0) {
      return Response.json({ message: 'Nenhuma preventiva para hoje', enviados: 0 });
    }

    const results = [];

    for (const cliente of clientes) {
      if (!cliente.telefone) continue;

      // Formatar telefone: remover não-dígitos e garantir código do país
      let telefone = cliente.telefone.replace(/\D/g, '');
      if (telefone.startsWith('0')) telefone = telefone.substring(1);
      if (!telefone.startsWith('55')) telefone = '55' + telefone;
      const toNumber = `whatsapp:+${telefone}`;

      const mensagem = `Olá, ${cliente.nome}! 👋\n\nPassamos para lembrar que hoje é o dia da *manutenção preventiva* do seu ar condicionado. ❄️\n\nEntre em contato conosco para agendar o horário mais conveniente.\n\nObrigado pela preferência! 😊`;

      const body = new URLSearchParams({
        From: fromNumber,
        To: toNumber,
        Body: mensagem
      });

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: body.toString()
        }
      );

      const data = await response.json();
      results.push({
        cliente: cliente.nome,
        telefone: toNumber,
        status: response.ok ? 'enviado' : 'erro',
        sid: data.sid,
        erro: data.message
      });
    }

    const enviados = results.filter(r => r.status === 'enviado').length;
    const erros = results.filter(r => r.status === 'erro').length;

    return Response.json({
      message: `Preventivas processadas: ${enviados} enviados, ${erros} erros`,
      enviados,
      erros,
      detalhes: results
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});