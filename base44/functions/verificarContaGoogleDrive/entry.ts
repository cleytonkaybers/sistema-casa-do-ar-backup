import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googledrive');

    // Buscar informações do usuário Google conectado
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!userInfoRes.ok) {
      throw new Error('Falha ao obter informações do usuário Google');
    }

    const userInfo = await userInfoRes.json();

    return Response.json({
      success: true,
      email: userInfo.email,
      nome: userInfo.name,
      id: userInfo.id,
      verified_email: userInfo.verified_email,
      picture: userInfo.picture
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});