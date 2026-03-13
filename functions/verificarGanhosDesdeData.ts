import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const payload = await req.json().catch(() => ({}));
    const dataDesde = payload.data_desde || '2024-01-01'; // padrão: início do ano

    // Buscar serviços concluídos desde a data
    const servicos = await base44.asServiceRole.entities.Servico.filter({ status: 'concluido' });
    const usuarios = await base44.asServiceRole.entities.User.list();
    const ganhosExistentes = await base44.asServiceRole.entities.GanhoTecnico.list();
    
    // Filtrar usuários não-admin
    const usuariosAtivos = usuarios.filter(u => u.role !== 'admin');
    
    // Encontrar serviços que ainda não têm ganhos registrados
    const servicosSemGanho = servicos.filter(s => {
      const dataServico = new Date(s.data_atualizacao_status || s.created_date);
      const dataSince = new Date(dataDesde);
      
      if (dataServico < dataSince) return false;
      
      // Verificar se já existe ganho para este serviço
      const ganhoDeste = ganhosExistentes.find(g => g.atendimento_id === s.id);
      return !ganhoDeste;
    });

    const precificacoes = await base44.asServiceRole.entities.PrecificacaoServico.list();
    const ganhosParaCriar = [];

    // Agrupar por equipe e criar ganhos
    const servicosPorEquipe = {};
    servicosSemGanho.forEach(s => {
      if (s.equipe_id) {
        if (!servicosPorEquipe[s.equipe_id]) {
          servicosPorEquipe[s.equipe_id] = [];
        }
        servicosPorEquipe[s.equipe_id].push(s);
      }
    });

    // Para cada equipe
    for (const [equipeId, servicosEquipe] of Object.entries(servicosPorEquipe)) {
      // Encontrar todos os membros não-admin que trabalharam nessa equipe
      const emailsMembros = new Set();
      
      servicosEquipe.forEach(s => {
        if (s.usuario_atualizacao_status) {
          const usuario = usuariosAtivos.find(u => u.email === s.usuario_atualizacao_status);
          if (usuario) {
            emailsMembros.add(s.usuario_atualizacao_status);
          }
        }
      });

      // Para cada serviço
      for (const servico of servicosEquipe) {
        const precificacao = precificacoes.find(p => p.tipo_servico === servico.tipo_servico);
        const comissaoPercentual = precificacao?.comissao_tecnico_percentual || 15;
        const valorComissao = (servico.valor || 0) * (comissaoPercentual / 100);

        // Criar ganho para cada membro da equipe
        for (const emailMembro of emailsMembros) {
          const usuarioMembro = usuariosAtivos.find(u => u.email === emailMembro);
          
          ganhosParaCriar.push({
            tecnico_email: emailMembro,
            tecnico_nome: usuarioMembro?.full_name || 'Sistema',
            atendimento_id: servico.id,
            cliente_nome: servico.cliente_nome,
            tipo_servico: servico.tipo_servico,
            valor_servico: servico.valor || 0,
            comissao_percentual: comissaoPercentual,
            valor_comissao: valorComissao,
            data_conclusao: servico.data_atualizacao_status || new Date().toISOString(),
            semana: getWeekOfYear(new Date(servico.data_atualizacao_status || new Date())),
            mes: getMesAno(new Date(servico.data_atualizacao_status || new Date())),
            pago: false
          });
        }
      }
    }

    // Criar todos em lote
    if (ganhosParaCriar.length > 0) {
      await base44.asServiceRole.entities.GanhoTecnico.bulkCreate(ganhosParaCriar);
    }

    return Response.json({
      sucesso: true,
      ganhosCriados: ganhosParaCriar.length,
      servicosProcessados: servicosSemGanho.length,
      mensagem: `${ganhosParaCriar.length} ganhos criados para ${servicosSemGanho.length} serviços`
    });
  } catch (error) {
    console.error('Erro:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getWeekOfYear(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return `${d.getUTCFullYear()}-W${String(Math.ceil((d - yearStart) / 86400000 / 7)).padStart(2, '0')}`;
}

function getMesAno(date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  return `${ano}-${mes}`;
}