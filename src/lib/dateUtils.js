import { format, startOfWeek, endOfWeek, addDays, parseISO, isValid, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Timezone do app: America/Manaus (UTC-4)
const TIMEZONE = 'America/Manaus';

/**
 * Obtém a data atual no timezone do app
 */
export function getLocalDate() {
  const now = new Date();
  // Criar data no timezone local sem conversão
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
}

/**
 * Converte uma data para o timezone do app
 */
export function toLocalDate(date) {
  if (!date) return null;
  
  // Se já é um objeto Date válido, retornar como está
  if (date instanceof Date && isValid(date)) {
    return date;
  }
  
  // Se é string, fazer parse
  if (typeof date === 'string') {
    const d = parseISO(date);
    if (!isValid(d)) return null;
    return d;
  }
  
  return null;
}

/**
 * Obtém o início da semana atual (segunda-feira 00:00:00)
 */
export function getStartOfWeek(date = null) {
  const baseDate = date ? toLocalDate(date) : getLocalDate();
  const start = startOfWeek(baseDate, { weekStartsOn: 1, locale: ptBR });
  return startOfDay(start);
}

/**
 * Obtém o fim da semana atual (domingo 23:59:59)
 */
export function getEndOfWeek(date = null) {
  const baseDate = date ? toLocalDate(date) : getLocalDate();
  const end = endOfWeek(baseDate, { weekStartsOn: 1, locale: ptBR });
  return endOfDay(end);
}

/**
 * Formata uma data para exibição
 */
export function formatDate(date, formatStr = "dd/MM/yyyy") {
  if (!date) return '';
  const d = toLocalDate(date);
  if (!d) return '';
  return format(d, formatStr, { locale: ptBR });
}

/**
 * Formata uma data para ISO string (YYYY-MM-DD)
 */
export function toISODate(date) {
  if (!date) return '';
  const d = toLocalDate(date);
  if (!d) return '';
  return format(d, 'yyyy-MM-dd');
}

/**
 * Verifica se uma data está na semana atual
 */
export function isInCurrentWeek(date) {
  if (!date) return false;
  const d = toLocalDate(date);
  if (!d) return false;
  
  const start = getStartOfWeek();
  const end = getEndOfWeek();
  
  return d >= start && d <= end;
}

/**
 * Obtém o nome do dia da semana
 */
export function getDayName(date) {
  const d = toLocalDate(date);
  if (!d) return '';
  return format(d, 'EEEE', { locale: ptBR });
}

/**
 * Adiciona dias a uma data
 */
export function addDaysToDate(date, days) {
  const d = toLocalDate(date);
  if (!d) return null;
  return addDays(d, days);
}