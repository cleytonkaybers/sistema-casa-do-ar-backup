import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Buscar todos os serviços concluídos
    const servicos = await base44.entities.Servico.filter({ status: 'concluido' });
    
    // Buscar todos os usuários
    const usuarios = await base44.entities.User.list();
    
    // Buscar todas as equipes
    const equipes = await base44.entities.Equipe.list();
    
    // Buscar ganhos existentes
    const ganhosExistentes = await base44.entities.GanhoTecnico.list();

    // Criar mapa de usuários por equipe (baseado em emails encontrados nos serviços)
    const usuariosPorEquipe = {};
    
    // Agrupar usuários por equipe baseado nos serviços concluídos
    servicos.forEach(servico => {
      if (servico.equipe_id && servico.usuario_atualizacao_status) {
        if (!usuariosPorEquipe[servico.equipe_id]) {
          usuariosPorEquipe[servico.equipe_id] = new Set();
        }
        usuariosPorEquipe[servico.equipe_id].add(servico.usuario_atualizacao_status);
      }
    });

    let ganhosCriados = 0;
    const erros = [];

    // Para cada serviço concluído
    for (const servico of servicos) {
      if (!servico.equipe_id || !servico.usuario_atualizacao_status) continue;

      const precificacao = await base44.entities.PrecificacaoServico.filter({
        tipo_servico: servico.tipo_servico
      });

      const comissaoPercentual = precificacao.length > 0 ? 
        (precificacao[0].comissao_tecnico_percentual || 15) : 15;

      const valorComissao = (servico.valor || 0) * (comissaoPercentual / 100);

      // Membros da equipe
      const membrosEquipe = Array.from(usuariosPorEquipe[servico.equipe_id] || []);

      // Para cada membro da equipe, criar um ganho
      for (const emailMembro of membrosEquipe) {
        // Verificar se já existe ganho para este membro e serviço
        const ganhoExistente = ganhosExistentes.find(g =>
          g.atendimento_id === servico.id &&
          g.tecnico_email === emailMembro
        );

        if (!ganhoExistente) {
          const usuarioMembro = usuarios.find(u => u.email === emailMembro);
          
          const novoGanho = {
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
          };

          await base44.entities.GanhoTecnico.create(novoGanho);
          ganhosCriados++;
        }
      }
    }

    return Response.json({
      sucesso: true,
      ganhosCriados,
      mensagem: `${ganhosCriados} ganhos duplicados por equipe`
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