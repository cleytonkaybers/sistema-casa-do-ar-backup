import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cliente_nome, tipo_servico, valor, servico_id } = await req.json();

    // Buscar todos os admins com permissão de serviço
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });

    const mensagem = `Cliente ${cliente_nome} pagou em dinheiro o serviço "${tipo_servico}"${valor ? ` (R$ ${Number(valor).toFixed(2)})` : ''}. Atualize em Pagamentos dos Clientes.`;

    await Promise.all(admins.map(admin =>
      base44.asServiceRole.entities.Notificacao.create({
        usuario_email: admin.email,
        tipo: 'pagamento_agendado',
        titulo: '💵 Pagamento em Dinheiro',
        mensagem,
        atendimento_id: servico_id || '',
        cliente_nome,
        lida: false,
      })
    ));

    return Response.json({ success: true, notificados: admins.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});