import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se o usuário já tem uma empresa associada
    const userWithEmpresa = await base44.asServiceRole.entities.User.filter({
      email: user.email
    });

    if (userWithEmpresa && userWithEmpresa.length > 0) {
      const userData = userWithEmpresa[0].data || {};
      
      // Se já tem empresa_id, não fazer nada
      if (userData.empresa_id) {
        return Response.json({ 
          message: 'Usuário já tem empresa', 
          empresa_id: userData.empresa_id 
        });
      }

      // Criar uma nova empresa com o nome baseado no email
      const empresaNome = user.full_name || user.email.split('@')[0];
      
      const novaEmpresa = await base44.asServiceRole.entities.Empresa.create({
        nome: empresaNome,
        email: user.email,
        ativa: true,
        plano: 'profissional'
      });

      // Associar o usuário à empresa
      const userData2 = userWithEmpresa[0].data || {};
      await base44.asServiceRole.entities.User.update(userWithEmpresa[0].id, {
        data: {
          ...userData2,
          empresa_id: novaEmpresa.id,
          tipo_usuario: 'admin_empresa',
          perfil: 'admin'
        }
      });

      return Response.json({ 
        success: true,
        empresa_id: novaEmpresa.id,
        message: `Empresa criada com sucesso para ${empresaNome}`
      });
    }

    return Response.json({ error: 'Usuário não encontrado' }, { status: 404 });
  } catch (error) {
    console.error('Erro:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});