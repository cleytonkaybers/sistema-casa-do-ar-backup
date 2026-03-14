import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Buscar todos os ganhos
        const ganhos = await base44.asServiceRole.entities.GanhoTecnico.list();
        
        // Agrupar por atendimento_id
        const groupedByAtendimento = {};
        ganhos.forEach(ganho => {
            const key = ganho.atendimento_id;
            if (!groupedByAtendimento[key]) {
                groupedByAtendimento[key] = [];
            }
            groupedByAtendimento[key].push(ganho);
        });

        // Identificar e remover duplicatas
        let deletedCount = 0;
        const duplicatas = [];

        for (const [atendimento_id, records] of Object.entries(groupedByAtendimento)) {
            if (records.length > 2) {
                // Mais de 2 registros é duplicata (deveria ser só 2: um por técnico da equipe)
                // Manter apenas os 2 primeiros
                const toDelete = records.slice(2);
                for (const record of toDelete) {
                    await base44.asServiceRole.entities.GanhoTecnico.delete(record.id);
                    deletedCount++;
                    duplicatas.push({
                        id: record.id,
                        cliente: record.cliente_nome,
                        servico: record.tipo_servico,
                        tecnico: record.tecnico_nome,
                        valor: record.valor_comissao
                    });
                }
            }
        }

        return Response.json({ 
            success: true,
            deletedCount,
            message: `Removidas ${deletedCount} duplicatas`,
            deletados: duplicatas
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});