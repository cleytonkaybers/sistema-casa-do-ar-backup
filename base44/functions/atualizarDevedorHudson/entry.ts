import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Buscar pagamento do cliente Hudson Nexa F7
    const pagamentos = await base44.entities.PagamentoCliente.filter({
      cliente_nome: 'Hudson Nexa F7'
    });

    if (!pagamentos || pagamentos.length === 0) {
      return Response.json({ error: 'Cliente Hudson Nexa F7 não encontrado' }, { status: 404 });
    }

    const pagamento = pagamentos[0];

    // Atualizar valor total para 400,00
    await base44.entities.PagamentoCliente.update(pagamento.id, {
      valor_total: 400.00,
      valor_pago: 0,
      status: 'pendente'
    });

    return Response.json({ 
      success: true, 
      message: 'Valor atualizado para R$ 400,00',
      pagamento_id: pagamento.id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});