import ExcelJS from 'exceljs';

/**
 * Exporta múltiplas abas para um arquivo .xlsx e faz o download no navegador.
 *
 * @param {Array<{ name: string, data: object[], colWidths: number[] }>} sheets
 * @param {string} filename - nome do arquivo com extensão .xlsx
 */
export async function exportarExcel(sheets, filename) {
  const workbook = new ExcelJS.Workbook();

  for (const { name, data, colWidths = [] } of sheets) {
    const sheet = workbook.addWorksheet(name);

    if (data.length === 0) continue;

    const keys = Object.keys(data[0]);
    sheet.columns = keys.map((key, i) => ({
      header: key,
      key,
      width: colWidths[i] ?? 15,
    }));

    // Negrito no cabeçalho
    sheet.getRow(1).font = { bold: true };

    sheet.addRows(data);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
