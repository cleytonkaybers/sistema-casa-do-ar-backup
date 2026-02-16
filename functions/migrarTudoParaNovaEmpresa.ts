import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Apenas o usuário original pode executar
    if (user.email !== 'cleyton_trylogya@hotmail.com') {
      return Response.json({ error: 'Apenas cleyton_trylogya@hotmail.com pode executar' }, { status: 403 });
    }

    const empresaAtual = user.empresa_id;
    const novoAdminEmail = 'casadoarclima@gmail.com';

    // 1. Buscar ou criar empresa para o novo admin
    let empresaNova = null;
    const empresasNovoAdmin = await base44.asServiceRole.entities.Empresa.filter({
      created_by: novoAdminEmail
    });
    
    if (empresasNovoAdmin.length === 0) {
      // Criar empresa com nome padrão
      empresaNova = await base44.asServiceRole.entities.Empresa.create({
        nome: 'Casa do Ar'
      });
    } else {
      empresaNova = empresasNovoAdmin[0];
    }

    // 2. Migrar clientes
    const clientes = await base44.asServiceRole.entities.Cliente.filter({
      empresa_id: empresaAtual
    });

    const clientesMigrados = await Promise.all(
      clientes.map(cliente =>
        base44.asServiceRole.entities.Cliente.update(cliente.id, {
          empresa_id: empresaNova.id
        })
      )
    );

    // 3. Migrar serviços
    const servicos = await base44.asServiceRole.entities.Servico.filter({
      empresa_id: empresaAtual
    });

    const servicosMigrados = await Promise.all(
      servicos.map(servico =>
        base44.asServiceRole.entities.Servico.update(servico.id, {
          empresa_id: empresaNova.id
        })
      )
    );

    // 4. Migrar atendimentos
    const atendimentos = await base44.asServiceRole.entities.Atendimento.filter({
      empresa_id: empresaAtual
    });

    const atendimentosMigrados = await Promise.all(
      atendimentos.map(atendimento =>
        base44.asServiceRole.entities.Atendimento.update(atendimento.id, {
          empresa_id: empresaNova.id
        })
      )
    );

    // 5. Migrar preventivas (se existir a entidade)
    let preventivasMigradas = [];
    try {
      const preventivas = await base44.asServiceRole.entities.PreventivaFutura.filter({
        empresa_id: empresaAtual
      });

      preventivasMigradas = await Promise.all(
        preventivas.map(preventiva =>
          base44.asServiceRole.entities.PreventivaFutura.update(preventiva.id, {
            empresa_id: empresaNova.id
          })
        )
      );
    } catch (e) {
      console.log('Entidade PreventivaFutura não encontrada, pulando...');
    }

    // 7. Migrar CompanySettings se existir
    const settings = await base44.asServiceRole.entities.CompanySettings.filter({
      created_by: user.email
    });

    let settingsMigrado = null;
    if (settings.length > 0) {
      // Deletar setting antigo e criar novo
      await Promise.all(settings.map(s => base44.asServiceRole.entities.CompanySettings.delete(s.id)));
      settingsMigrado = await base44.asServiceRole.entities.CompanySettings.create({
        company_name: settings[0].company_name || 'Casa do Ar',
        company_icon: settings[0].company_icon || 'Snowflake',
        company_logo_url: settings[0].company_logo_url || ''
      });
    }

    return Response.json({
      success: true,
      message: 'Migração concluída com sucesso',
      resumo: {
        empresaId: empresaNova.id,
        empresaNome: empresaNova.nome,
        clientesMigrados: clientesMigrados.length,
        servicosMigrados: servicosMigrados.length,
        atendimentosMigrados: atendimentosMigrados.length,
        preventivasMigradas: preventivasMigradas.length,
        usuariosMigrados: usuariosMigrados.length,
        settingsMigrado: settingsMigrado ? 'Sim' : 'Não'
      }
    });
  } catch (error) {
    console.error('Erro na migração:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});