import { conexion } from "../config/database.js";
import { exceljs } from "exceljs";
import { fs } from "fs";

export const generateReportByDate = async (req, res) => {
  const { fechaInicio, fechaFin } = req.params;
  try {
    const [rows] = await conexion.execute(
      "SELECT * FROM accesos WHERE fecha BETWEEN ? AND ?",
      [fechaInicio, fechaFin]
    );
    await generateExcelReport(rows);
    res.download("utils/reports/Reporte_Accesos.xlsx", "Reporte_Accesos.xlsx", (err) => {
      if (err) {
        console.error("Error al descargar el archivo:", err);
        res.status(500).json({ error: "Error al descargar el archivo" });
      }
    });
    //res.json(rows);
  } catch (error) {
    console.error("Error al generar el reporte:", error);
    res.status(500).json({ error: "Error al generar el reporte" });
  }
};

async function generateExcelReport(data) {
  try{
  const path = "utils/reports/Template_XLSX.xlsx";
  const outputPath = "utils/reports/Reporte_Accesos.xlsx";
  
  //Cargar la plantilla existente
  if (!fs.existsSync(path)) {
    console.error('La plantilla no existe en la ruta especificada:', path);
    return;
  }
  const workbook = await exceljs.Workbook();
  await workbook.xlsx.readFile(path);
   console.log('Plantilla cargada correctamente desde:', path);
  // SELECCIONAR HOJA 1
  const hojaPadre = workbook.getWorksheet(1);
  if (!hojaPadre){
    console.error('No se pudo encontrar la hoja en la plantilla.');
    return;
  }
  // CALCULAR LAS HOJAS REQUERIDAS 30 registros por por hoja
  if (data.length > 30) {
    const numHojas = Math.ceil(data.length / 30);
    // Crear nuevas hojas si es necesario
    //  Y Copiar el contenido y estlos de la hoja.
    for (let i = 1; i < numHojas; i++) {
      const nuevaHoja = workbook.addWorksheet(`Hoja ${i + 1}`);
      hojaPadre.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        const nuevaFila = nuevaHoja.getRow(rowNumber);
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const nuevaCelda = nuevaFila.getCell(colNumber);
          // Copiar el valor y el estilo de la celda original
          nuevaCelda.value = cell.value;
          nuevaCelda.style = { ...cell.style };
        });
        nuevaFila.commit();
      });
      // Copiar celdas combinadas
      hojaPadre.mergeCells.forEach(range => {
        nuevaHoja.mergeCells(range);
      });
      // Copiar Imagenes
      workbook.meadia.forEach(media => {
        if (media.type === 'image') {
          // Buscar posición actual
          media.worksheet && media.worksheet.forEach(ws => {
            if (ws.worksheetId === hojaPadre.id) {
              nuevaHoja.addImage(media.index, ws.range);
            };
          });
        };
      });
    }
  }
  // Guardar el archivo Excel resultante
  await woorkbook.xlsx.writeFile(outputPath);
  console.log('Reporte generado correctamente en:', outputPath);
  return outputPath;
  }catch (error) {
    console.error('Error al cargar o modificar la plantilla:', error.message);
  }
}