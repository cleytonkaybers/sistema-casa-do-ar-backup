import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Buscar todos os ganhos com valor_comissao = 0
    const ganhos = await base44.asServiceRole.entities.GanhoTecnico.list();
    const ganhosZero = ganhos.filter(g => g.valor_comissao === 0 || g.valor_servico === 0);

    console.log(`Encontrados ${ganhosZero.length} ganhos com valor zero`);

    // Deletar em lotes pequenos para evitar rate limit
    let deletados = 0;
    const batch = 5;

    for (let i = 0; i < ganhosZero.length; i += batch) {
      const lote = ganhosZero.slice(i, i + batch);
      
      for (const ganho of lote) {
        try {
          await base44.asServiceRole.entities.GanhoTecnico.delete(ganho.id);
          deletados++;
          console.log(`Deletado ganho ${ganho.id}`);
        } catch (e) {
          console.error(`Erro ao deletar ${ganho.id}:`, e.message);
        }
      }

      // Pequena pausa entre lotes
      if (i + batch < ganhosZero.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Agora buscar serviços com valor > 0 que não têm ganhos
    const servicos = await base44.asServiceRole.entities.Servico.filter({ status: 'concluido' });
    const usuarios = await base44.asServiceRole.entities.User.list();
    const ganhosAtuais = await base44.asServiceRole.entities.GanhoTecnico.list();
    
    const usuariosAtivos = usuarios.filter(u => u.role !== 'admin' && u.data?.tipo_usuario !== 'administrativo');
    const precificacoes = await base44.asServiceRole.entities.PrecificacaoServico.list();

    // Filtrar serviços com valor > 0 que ainda não têm ganho
    const servicosSemGanho = servicos.filter(s => {
      if (!s.valor || s.valor <= 0) return false;
      if (!s.equipe_id) return false;
      const ganhoDeste = ganhosAtuais.find(g => g.atendimento_id === s.id);
      return !ganhoDeste;
    });

    console.log(`Encontrados ${servicosSemGanho.length} serviços com valor sem ganho`);

    const ganhosParaCriar = [];

    for (const servico of servicosSemGanho) {
      // Encontrar membros não-admin da equipe
      const emailsMembros = new Set();
      const servicosEquipe = servicos.filter(se => se.equipe_id === servico.equipe_id);
      
      servicosEquipe.forEach(s => {
        if (s.usuario_atualizacao_status) {
          const usuario = usuariosAtivos.find(u => u.email === s.usuario_atualizacao_status);
          if (usuario) {
            emailsMembros.add(s.usuario_atualizacao_status);
          }
        }
      });

      const precificacao = precificacoes.find(p => p.tipo_servico === servico.tipo_servico);
      const comissaoPercentual = precificacao?.comissao_tecnico_percentual || 15;
      const valorComissao = (servico.valor || 0) * (comissaoPercentual / 100);

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

    if (ganhosParaCriar.length > 0) {
      await base44.asServiceRole.entities.GanhoTecnico.bulkCreate(ganhosParaCriar);
    }

    return Response.json({
      sucesso: true,
      deletados,
      ganhosCriados: ganhosParaCriar.length,
      servicosProcessados: servicosSemGanho.length,
      mensagem: `${deletados} ganhos deletados, ${ganhosParaCriar.length} novos ganhos criados`
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