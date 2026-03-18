import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);
    
    // Ack inicial do Google
    const state = body.data._provider_meta?.['x-goog-resource-state'];
    if (state === 'sync') {
      return Response.json({ status: 'sync_ack' });
    }

    // Obter token de acesso
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    const authHeader = { Authorization: `Bearer ${accessToken}` };

    // Carregar syncToken do banco
    const existing = await base44.asServiceRole.entities.SyncState.filter({ provider: 'googlecalendar' });
    const syncRecord = existing.length > 0 ? existing[0] : null;

    let url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=100';
    
    if (syncRecord?.sync_token) {
      url += `&syncToken=${syncRecord.sync_token}`;
    } else {
      // Primeira sync: últimos 7 dias
      const timeMin = new Date(Date.now() - 7*24*60*60*1000).toISOString();
      url += `&timeMin=${timeMin}`;
    }

    let res = await fetch(url, { headers: authHeader });
    
    // Token expirado? Refazer sync
    if (res.status === 410) {
      url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=100'
        + '&timeMin=' + new Date(Date.now() - 7*24*60*60*1000).toISOString();
      res = await fetch(url, { headers: authHeader });
    }

    if (!res.ok) {
      return Response.json({ status: 'api_error', code: res.status }, { status: 500 });
    }

    // Coletar todas as páginas
    const allItems = [];
    let newSyncToken = null;
    let pageData = await res.json();

    while (true) {
      allItems.push(...(pageData.items || []));
      if (pageData.nextSyncToken) newSyncToken = pageData.nextSyncToken;
      if (!pageData.nextPageToken) break;

      const nextRes = await fetch(
        url + `&pageToken=${pageData.nextPageToken}`,
        { headers: authHeader }
      );
      if (!nextRes.ok) break;
      pageData = await nextRes.json();
    }

    // Processar eventos (criar serviços para novos eventos)
    let servicosCriados = 0;
    
    for (const event of allItems) {
      // Ignorar eventos cancelados ou sem data
      if (event.status === 'cancelled' || !event.start?.dateTime) continue;
      
      // Verificar se já existe serviço para este evento
      const servicosExistentes = await base44.asServiceRole.entities.Servico.filter({
        descricao: `[Google Calendar] ${event.id}`
      });
      
      if (servicosExistentes.length > 0) continue;

      // Criar novo serviço
      const dataEvento = new Date(event.start.dateTime);
      const horario = dataEvento.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      await base44.asServiceRole.entities.Servico.create({
        cliente_nome: event.summary || 'Evento sem título',
        telefone: event.location || '',
        endereco: event.location || '',
        tipo_servico: 'Limpeza de 9k', // Tipo padrão
        data_programada: dataEvento.toISOString().split('T')[0],
        horario: horario,
        dia_semana: dataEvento.toLocaleDateString('pt-BR', { weekday: 'long' }),
        descricao: `[Google Calendar] ${event.id}\n${event.description || ''}`,
        status: 'agendado',
      });
      
      servicosCriados++;
    }

    // Salvar novo syncToken
    if (newSyncToken) {
      if (syncRecord) {
        await base44.asServiceRole.entities.SyncState.update(syncRecord.id, {
          sync_token: newSyncToken,
          last_sync: new Date().toISOString()
        });
      } else {
        await base44.asServiceRole.entities.SyncState.create({
          provider: 'googlecalendar',
          sync_token: newSyncToken,
          last_sync: new Date().toISOString()
        });
      }
    }

    return Response.json({
      status: 'success',
      eventos_processados: allItems.length,
      servicos_criados: servicosCriados
    });

  } catch (error) {
    console.error('Erro na sync do Calendar:', error);
    return Response.json({
      status: 'error',
      message: error.message
    }, { status: 500 });
  }
});