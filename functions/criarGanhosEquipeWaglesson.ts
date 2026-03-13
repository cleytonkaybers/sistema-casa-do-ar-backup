import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Equipe 2 = 699e54e99bb56cb59de69c61
    const equipeId = '699e54e99bb56cb59de69c61';
    
    const usuarios = await base44.asServiceRole.entities.User.list();
    const servicos = await base44.asServiceRole.entities.Servico.filter({ equipe_id: equipeId, status: 'concluido' });
    const ganhosExistentes = await base44.asServiceRole.entities.GanhoTecnico.list();
    const precificacoes = await base44.asServiceRole.entities.PrecificacaoServico.list();

    // Filtrar usuários ativos (não admin, não administrativo)
    const usuariosAtivos = usuarios.filter(u => 
      u.role !== 'admin' && 
      u.data?.tipo_usuario !== 'administrativo' &&
      u.data?.perfil !== 'admin'
    );

    console.log('Usuários ativos na equipe:', usuariosAtivos.map(u => ({ email: u.email, nome: u.full_name })));

    // Encontrar serviços com valor > 0 que não têm ganhos para todos os membros
    let ganhosParaCriar = [];

    for (const servico of servicos) {
      if (!servico.valor || servico.valor <= 0) continue;

      for (const usuario of usuariosAtivos) {
        // Verificar se este usuário já tem ganho para este serviço
        const jaTemGanho = ganhosExistentes.find(g => 
          g.atendimento_id === servico.id && 
          g.tecnico_email === usuario.email
        );

        if (!jaTemGanho) {
          const precificacao = precificacoes.find(p => p.tipo_servico === servico.tipo_servico);
          const comissaoPercentual = precificacao?.comissao_tecnico_percentual || 15;
          const valorComissao = (servico.valor || 0) * (comissaoPercentual / 100);

          ganhosParaCriar.push({
            tecnico_email: usuario.email,
            tecnico_nome: usuario.full_name || 'Sistema',
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

          console.log(`Criando ganho para ${usuario.full_name} (${usuario.email}) - Serviço ${servico.cliente_nome}`);
        }
      }
    }

    if (ganhosParaCriar.length > 0) {
      await base44.asServiceRole.entities.GanhoTecnico.bulkCreate(ganhosParaCriar);
    }

    return Response.json({
      sucesso: true,
      ganhosCriados: ganhosParaCriar.length,
      usuariosAtivos: usuariosAtivos.length,
      mensagem: `${ganhosParaCriar.length} ganhos criados para ${usuariosAtivos.length} membros da equipe`
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