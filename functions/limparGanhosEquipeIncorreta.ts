import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Mapeamento correto de equipes
    const membrosMapeados = {
      '699e54e99bb56cb59de69c60': ['vinihenrique781@gmail.com', 'vgabrielkaybersdossantos@gmail.com'], // Equipe 1: Vini e Vitor
      '699e54e99bb56cb59de69c61': ['witalok73@gmail.com', 'waglessonribero@gmail.com'] // Equipe 2: Kaue e Waglesson
    };

    // Buscar todos os ganhos
    const ganhos = await base44.asServiceRole.entities.GanhoTecnico.list();
    
    // Buscar todos os serviços
    const servicos = await base44.asServiceRole.entities.Servico.list();
    
    let removidos = 0;
    const ganhosParaRemover = [];

    for (const ganho of ganhos) {
      // Encontrar o serviço relacionado
      const servico = servicos.find(s => s.id === ganho.atendimento_id);
      
      if (!servico || !servico.equipe_id) continue;
      
      // Verificar se o técnico pertence à equipe do serviço
      const membrosCorretos = membrosMapeados[servico.equipe_id] || [];
      
      if (!membrosCorretos.includes(ganho.tecnico_email)) {
        // Ganho incorreto - técnico não pertence à equipe do serviço
        ganhosParaRemover.push({
          id: ganho.id,
          tecnico: ganho.tecnico_email,
          cliente: ganho.cliente_nome,
          equipe_servico: servico.equipe_nome,
          servico_id: servico.id
        });
        
        await base44.asServiceRole.entities.GanhoTecnico.delete(ganho.id);
        removidos++;
      }
    }

    return Response.json({
      sucesso: true,
      removidos,
      detalhes: ganhosParaRemover,
      mensagem: `${removidos} ganhos incorretos foram removidos`
    });
  } catch (error) {
    console.error('Erro:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});