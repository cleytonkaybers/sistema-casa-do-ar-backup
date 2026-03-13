import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Deletar ganhos existentes para refazer
    const ganhosExistentes = await base44.asServiceRole.entities.GanhoTecnico.list();
    
    if (ganhosExistentes.length > 0) {
      // Deletar em lotes para evitar rate limit
      for (let i = 0; i < ganhosExistentes.length; i += 100) {
        const lote = ganhosExistentes.slice(i, i + 100);
        for (const ganho of lote) {
          await base44.asServiceRole.entities.GanhoTecnico.delete(ganho.id);
        }
      }
    }

    // Buscar serviços concluídos
    const servicos = await base44.asServiceRole.entities.Servico.filter({ status: 'concluido' });
    const usuarios = await base44.asServiceRole.entities.User.list();
    
    // Filtrar usuários não-admin
    const usuariosAtivos = usuarios.filter(u => u.role !== 'admin');
    
    // Buscar precificações
    const precificacoes = await base44.asServiceRole.entities.PrecificacaoServico.list();

    let ganhosCriados = 0;
    const ganhosParaCriar = [];

    // Agrupar serviços por equipe
    const servicosPorEquipe = {};
    servicos.forEach(s => {
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

      // Para cada serviço concluído na equipe
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
      ganhosCriados = ganhosParaCriar.length;
    }

    return Response.json({
      sucesso: true,
      ganhosCriados,
      totalEquipes: Object.keys(servicosPorEquipe).length,
      mensagem: `${ganhosCriados} ganhos sincronizados para todas as equipes`
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