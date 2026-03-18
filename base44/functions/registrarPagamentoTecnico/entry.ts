import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Acesso negado. Apenas administradores podem registrar pagamentos.' }, { status: 403 });
    }

    const { tecnico_id, valor_pago, data_pagamento, metodo_pagamento, observacao, nota, lancamentos_relacionados = [], lancamentos_id = [] } = await req.json();
    
    // Aceitar tanto lancamentos_relacionados quanto lancamentos_id (compatibilidade)
    const lancamentosIds = lancamentos_relacionados.length > 0 ? lancamentos_relacionados : lancamentos_id;

    if (!tecnico_id || !valor_pago || valor_pago <= 0) {
      return Response.json({ error: 'Dados inválidos. Verifique tecnico_id e valor_pago.' }, { status: 400 });
    }

    // Buscar informações do técnico
    const tecnicoFinanceiro = await base44.asServiceRole.entities.TecnicoFinanceiro.filter({
      tecnico_id: tecnico_id
    });

    if (!tecnicoFinanceiro || tecnicoFinanceiro.length === 0) {
      return Response.json({ error: 'Técnico não encontrado no sistema financeiro.' }, { status: 404 });
    }

    const tecnico = tecnicoFinanceiro[0];

    // Criar registro de pagamento
    const pagamento = await base44.asServiceRole.entities.PagamentoTecnico.create({
      tecnico_id,
      tecnico_nome: tecnico.tecnico_nome,
      equipe_id: tecnico.equipe_id,
      equipe_nome: tecnico.equipe_nome,
      lancamentos_id: lancamentosIds,
      valor_pago,
      data_pagamento,
      metodo_pagamento,
      observacao: nota || observacao || '',
      registrado_por: user.email,
      status: 'Confirmado'
    });

    // Atualizar crédito do técnico (permite valor negativo se pagar a mais)
    const novoCredito = tecnico.credito_pendente - valor_pago;
    const novoTotal = tecnico.credito_pago + valor_pago;

    await base44.asServiceRole.entities.TecnicoFinanceiro.update(tecnico.id, {
      credito_pendente: novoCredito,
      credito_pago: novoTotal,
      total_ganho: tecnico.total_ganho || (tecnico.credito_pendente + tecnico.credito_pago),
      data_ultimo_pagamento: new Date().toISOString()
    });

    // Marcar lançamentos como pagos automaticamente
    // Buscar lançamentos pendentes do técnico e marcar como pagos até atingir o valor pago
    const lancamentosPendentes = await base44.asServiceRole.entities.LancamentoFinanceiro.filter({
      tecnico_id: tecnico_id,
      status: 'pendente'
    });
    
    // Ordenar por data (mais antigos primeiro)
    lancamentosPendentes.sort((a, b) => new Date(a.data_geracao) - new Date(b.data_geracao));
    
    let valorRestante = valor_pago;
    const lancamentosAtualizados = [];
    
    for (const lanc of lancamentosPendentes) {
      if (valorRestante <= 0) break;
      
      await base44.asServiceRole.entities.LancamentoFinanceiro.update(lanc.id, {
        status: 'pago',
        data_pagamento: new Date().toISOString(),
        usuario_pagamento: user.email
      });
      
      lancamentosAtualizados.push(lanc.id);
      valorRestante -= (lanc.valor_comissao_tecnico || 0);
    }

    return Response.json({
      success: true,
      pagamento,
      novoCredito,
      mensagem: `Pagamento de R$ ${valor_pago.toFixed(2)} registrado com sucesso.`
    });
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});