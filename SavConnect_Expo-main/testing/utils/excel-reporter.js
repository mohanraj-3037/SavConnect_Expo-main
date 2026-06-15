/**
 * ──────────────────────────────────────────────────────────────
 * SavConnect Testing Suite — Excel Report Generator
 * ──────────────────────────────────────────────────────────────
 * Generates a comprehensive .xlsx report with:
 *   • Executive Summary sheet with charts
 *   • Full Test Results sheet with all 125 test cases
 *   • Category-specific sheets (UI/UX, Functional, etc.)
 *   • Deployable Status sheet with go/no-go verdict
 *   • Conditional formatting (green/red/yellow)
 *   • Auto-sized columns & branded headers
 */
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// ─── Brand Colors ─────────────────────────────────────────────
const COLORS = {
  primary: '1B1F3B',
  accent: '00BFA6',
  white: 'FFFFFF',
  pass: 'E8F5E9',
  passBorder: '43A047',
  passText: '1B5E20',
  fail: 'FFEBEE',
  failBorder: 'E53935',
  failText: 'B71C1C',
  skip: 'FFF8E1',
  skipBorder: 'F9A825',
  skipText: 'E65100',
  headerBg: '1B1F3B',
  headerText: 'FFFFFF',
  altRow: 'F5F7FA',
  border: 'E5E7EB',
};

// ─── Category Labels ──────────────────────────────────────────
const CATEGORIES = [
  'UI/UX', 'Functional', 'Validation', 'API', 'Unit',
  'Performance', 'Security', 'Accessibility', 'Responsive', 'Deployable',
];

/**
 * Generate a comprehensive Excel test report.
 * @param {Array<object>} results — Array of test result objects
 * @param {string} [outputDir] — Directory to save the report
 * @returns {Promise<string>} — Path to the generated file
 */
async function generateExcelReport(results, outputDir = './reports') {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `SavConnect_Test_Report_${timestamp}.xlsx`;
  const filepath = path.join(outputDir, filename);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SavConnect QA Suite';
  workbook.created = new Date();
  workbook.modified = new Date();

  // ─── 1. Executive Summary Sheet ──────────────────────────────
  createSummarySheet(workbook, results);

  // ─── 2. All Test Results Sheet ───────────────────────────────
  createAllResultsSheet(workbook, results);

  // ─── 3. Category-Specific Sheets ─────────────────────────────
  const categoryGroups = {};
  for (const r of results) {
    const cat = r.category || 'Other';
    if (!categoryGroups[cat]) categoryGroups[cat] = [];
    categoryGroups[cat].push(r);
  }

  for (const category of CATEGORIES) {
    const catResults = categoryGroups[category] || [];
    if (catResults.length > 0) {
      createCategorySheet(workbook, category, catResults);
    }
  }

  // ─── 4. Deployable Status Sheet ──────────────────────────────
  createDeployableSheet(workbook, results);

  // ─── Save ────────────────────────────────────────────────────
  await workbook.xlsx.writeFile(filepath);
  return filepath;
}

// ═══════════════════════════════════════════════════════════════
// SHEET BUILDERS
// ═══════════════════════════════════════════════════════════════

function createSummarySheet(workbook, results) {
  const ws = workbook.addWorksheet('Executive Summary', {
    properties: { tabColor: { argb: COLORS.accent } },
  });

  const total = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
  const avgDuration = total > 0
    ? (results.reduce((sum, r) => sum + (r.duration || 0), 0) / total).toFixed(0)
    : 0;

  // Title
  ws.mergeCells('A1:G1');
  const titleCell = ws.getCell('A1');
  titleCell.value = '🎓 SavConnect — Test Execution Report';
  titleCell.font = { size: 20, bold: true, color: { argb: COLORS.headerText } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 45;

  // Subtitle
  ws.mergeCells('A2:G2');
  const subCell = ws.getCell('A2');
  subCell.value = `Generated: ${new Date().toLocaleString('en-IN')} | Comprehensive E2E Testing Suite`;
  subCell.font = { size: 11, italic: true, color: { argb: '9CA3AF' } };
  subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
  subCell.alignment = { horizontal: 'center' };
  ws.getRow(2).height = 25;

  // Spacer
  ws.getRow(3).height = 10;

  // ─── Summary Metrics ─────────────────────────────────────────
  const metricsHeader = ws.getRow(4);
  ws.mergeCells('A4:G4');
  const mhCell = ws.getCell('A4');
  mhCell.value = '📊 EXECUTION SUMMARY';
  mhCell.font = { size: 14, bold: true, color: { argb: COLORS.primary } };
  ws.getRow(4).height = 30;

  const metrics = [
    ['Total Test Cases', total, 'Passed ✅', passed, 'Pass Rate', `${passRate}%`, ''],
    ['Failed ❌', failed, 'Skipped ⏭️', skipped, 'Avg Duration', `${avgDuration}ms`, ''],
  ];

  let row = 5;
  for (const m of metrics) {
    const r = ws.getRow(row);
    r.values = ['', m[0], m[1], m[2], m[3], m[4], m[5]];
    r.font = { size: 12 };
    r.getCell(2).font = { size: 12, bold: true, color: { argb: '6B7280' } };
    r.getCell(3).font = { size: 14, bold: true, color: { argb: COLORS.accent } };
    r.getCell(4).font = { size: 12, bold: true, color: { argb: '6B7280' } };
    r.getCell(5).font = { size: 14, bold: true, color: { argb: COLORS.accent } };
    r.getCell(6).font = { size: 12, bold: true, color: { argb: '6B7280' } };
    r.getCell(7).font = { size: 14, bold: true, color: { argb: COLORS.accent } };
    r.height = 28;
    row++;
  }

  // ─── Overall Verdict ──────────────────────────────────────────
  row += 1;
  ws.mergeCells(`A${row}:G${row}`);
  const verdictCell = ws.getCell(`A${row}`);
  const verdict = passRate >= 90 ? '✅ DEPLOYABLE — All critical tests passed'
    : passRate >= 70 ? '⚠️ CONDITIONAL — Some tests failed, review required'
    : '❌ NOT DEPLOYABLE — Critical failures detected';
  const verdictColor = passRate >= 90 ? COLORS.pass
    : passRate >= 70 ? COLORS.skip : COLORS.fail;
  verdictCell.value = verdict;
  verdictCell.font = { size: 14, bold: true };
  verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: verdictColor } };
  verdictCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(row).height = 40;

  // ─── Category Breakdown ───────────────────────────────────────
  row += 2;
  ws.mergeCells(`A${row}:G${row}`);
  ws.getCell(`A${row}`).value = '📋 CATEGORY BREAKDOWN';
  ws.getCell(`A${row}`).font = { size: 14, bold: true, color: { argb: COLORS.primary } };
  ws.getRow(row).height = 30;
  row++;

  // Category header
  const catHeaderRow = ws.getRow(row);
  catHeaderRow.values = ['', 'Category', 'Total', 'Passed', 'Failed', 'Skipped', 'Pass Rate'];
  catHeaderRow.eachCell((cell, colNumber) => {
    if (colNumber > 1) {
      cell.font = { bold: true, color: { argb: COLORS.headerText }, size: 11 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
      cell.alignment = { horizontal: 'center' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: COLORS.border } },
      };
    }
  });
  ws.getRow(row).height = 28;
  row++;

  for (const cat of CATEGORIES) {
    const catResults = results.filter(r => r.category === cat);
    if (catResults.length === 0) continue;
    const catPassed = catResults.filter(r => r.status === 'PASS').length;
    const catFailed = catResults.filter(r => r.status === 'FAIL').length;
    const catSkipped = catResults.filter(r => r.status === 'SKIP').length;
    const catRate = ((catPassed / catResults.length) * 100).toFixed(1);

    const catRow = ws.getRow(row);
    catRow.values = ['', cat, catResults.length, catPassed, catFailed, catSkipped, `${catRate}%`];
    catRow.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        cell.alignment = { horizontal: 'center' };
        cell.border = { bottom: { style: 'thin', color: { argb: COLORS.border } } };
      }
    });
    // Color the pass rate cell
    const rateCell = catRow.getCell(7);
    if (parseFloat(catRate) >= 90) {
      rateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.pass } };
      rateCell.font = { bold: true, color: { argb: COLORS.passText } };
    } else if (parseFloat(catRate) >= 70) {
      rateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.skip } };
      rateCell.font = { bold: true, color: { argb: COLORS.skipText } };
    } else {
      rateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.fail } };
      rateCell.font = { bold: true, color: { argb: COLORS.failText } };
    }

    if (row % 2 === 0) {
      catRow.eachCell((cell, colNumber) => {
        if (colNumber > 1 && !cell.fill?.fgColor) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.altRow } };
        }
      });
    }
    row++;
  }

  // Auto-size columns
  ws.columns = [
    { width: 3 }, { width: 22 }, { width: 14 }, { width: 14 },
    { width: 14 }, { width: 14 }, { width: 14 },
  ];
}

function createAllResultsSheet(workbook, results) {
  const ws = workbook.addWorksheet('All Test Results', {
    properties: { tabColor: { argb: COLORS.primary } },
  });

  // Header
  ws.mergeCells('A1:H1');
  const titleCell = ws.getCell('A1');
  titleCell.value = '📋 Complete Test Results — SavConnect E2E Suite';
  titleCell.font = { size: 16, bold: true, color: { argb: COLORS.headerText } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 38;

  // Column headers
  const headerRow = ws.getRow(3);
  headerRow.values = ['Test ID', 'Test Case', 'Category', 'Type', 'Status', 'Duration (ms)', 'Error Message', 'Timestamp'];
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: COLORS.headerText }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      bottom: { style: 'medium', color: { argb: COLORS.accent } },
    };
  });
  ws.getRow(3).height = 30;

  // Data rows
  let rowNum = 4;
  for (const result of results) {
    const row = ws.getRow(rowNum);
    row.values = [
      result.id || `TC-${String(rowNum - 3).padStart(3, '0')}`,
      result.name || '',
      result.category || '',
      result.type || '',
      result.status || 'SKIP',
      result.duration || 0,
      result.error || '',
      result.timestamp || new Date().toISOString(),
    ];

    // Status cell formatting
    const statusCell = row.getCell(5);
    if (result.status === 'PASS') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.pass } };
      statusCell.font = { bold: true, color: { argb: COLORS.passText } };
    } else if (result.status === 'FAIL') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.fail } };
      statusCell.font = { bold: true, color: { argb: COLORS.failText } };
    } else {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.skip } };
      statusCell.font = { bold: true, color: { argb: COLORS.skipText } };
    }
    statusCell.alignment = { horizontal: 'center' };

    // Alternate row coloring
    if (rowNum % 2 === 0) {
      row.eachCell((cell, colNumber) => {
        if (colNumber !== 5) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.altRow } };
        }
      });
    }

    // Borders
    row.eachCell((cell) => {
      cell.border = { bottom: { style: 'thin', color: { argb: COLORS.border } } };
      cell.alignment = { ...cell.alignment, vertical: 'middle', wrapText: true };
    });

    rowNum++;
  }

  // Auto-size columns
  ws.columns = [
    { width: 10 }, { width: 55 }, { width: 16 }, { width: 14 },
    { width: 12 }, { width: 16 }, { width: 45 }, { width: 22 },
  ];

  // Freeze header
  ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 3 }];
}

function createCategorySheet(workbook, category, results) {
  const safeName = `${category} Tests`.replace(/[*?:\\\/\[\]]/g, '-');
  const ws = workbook.addWorksheet(safeName, {
    properties: { tabColor: { argb: COLORS.accent } },
  });

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const passRate = ((passed / results.length) * 100).toFixed(1);

  // Title
  ws.mergeCells('A1:G1');
  const titleCell = ws.getCell('A1');
  titleCell.value = `${category} Testing — ${results.length} Test Cases | Pass Rate: ${passRate}%`;
  titleCell.font = { size: 14, bold: true, color: { argb: COLORS.headerText } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 35;

  // Summary row
  const summaryRow = ws.getRow(2);
  summaryRow.values = ['', `✅ Passed: ${passed}`, '', `❌ Failed: ${failed}`, '', `📊 Rate: ${passRate}%`, ''];
  summaryRow.getCell(2).font = { bold: true, color: { argb: COLORS.passText } };
  summaryRow.getCell(4).font = { bold: true, color: { argb: COLORS.failText } };
  summaryRow.getCell(6).font = { bold: true, color: { argb: COLORS.accent } };
  ws.getRow(2).height = 25;

  // Column headers
  const headerRow = ws.getRow(4);
  headerRow.values = ['Test ID', 'Test Case', 'Type', 'Status', 'Duration (ms)', 'Error Message', 'Timestamp'];
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: COLORS.headerText }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    cell.alignment = { horizontal: 'center' };
  });
  ws.getRow(4).height = 28;

  // Data
  let rowNum = 5;
  for (const result of results) {
    const row = ws.getRow(rowNum);
    row.values = [
      result.id, result.name, result.type || category,
      result.status, result.duration || 0, result.error || '',
      result.timestamp || new Date().toISOString(),
    ];

    const statusCell = row.getCell(4);
    if (result.status === 'PASS') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.pass } };
      statusCell.font = { bold: true, color: { argb: COLORS.passText } };
    } else if (result.status === 'FAIL') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.fail } };
      statusCell.font = { bold: true, color: { argb: COLORS.failText } };
    } else {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.skip } };
      statusCell.font = { bold: true, color: { argb: COLORS.skipText } };
    }
    statusCell.alignment = { horizontal: 'center' };

    if (rowNum % 2 === 0) {
      row.eachCell((cell, colNumber) => {
        if (colNumber !== 4) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.altRow } };
        }
      });
    }

    row.eachCell((cell) => {
      cell.border = { bottom: { style: 'thin', color: { argb: COLORS.border } } };
      cell.alignment = { ...cell.alignment, vertical: 'middle', wrapText: true };
    });
    rowNum++;
  }

  ws.columns = [
    { width: 10 }, { width: 55 }, { width: 14 }, { width: 12 },
    { width: 16 }, { width: 40 }, { width: 22 },
  ];

  ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 4 }];
}

function createDeployableSheet(workbook, results) {
  const ws = workbook.addWorksheet('Deployable Status', {
    properties: { tabColor: { argb: 'E53935' } },
  });

  const total = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';

  // Title
  ws.mergeCells('A1:E1');
  const titleCell = ws.getCell('A1');
  titleCell.value = '🚀 DEPLOYMENT READINESS REPORT';
  titleCell.font = { size: 18, bold: true, color: { argb: COLORS.headerText } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 45;

  // Info
  const info = [
    ['Application', 'SavConnect — Campus Networking Hub'],
    ['Frontend', 'https://sav-connect-expo.vercel.app'],
    ['Backend', 'https://savconnectexpo-production.up.railway.app'],
    ['Test Date', new Date().toLocaleString('en-IN')],
    ['Total Tests', total],
    ['Passed', passed],
    ['Failed', failed],
    ['Pass Rate', `${passRate}%`],
  ];

  let row = 3;
  for (const [label, value] of info) {
    ws.mergeCells(`A${row}:B${row}`);
    ws.mergeCells(`C${row}:E${row}`);
    ws.getCell(`A${row}`).value = label;
    ws.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: COLORS.primary } };
    ws.getCell(`C${row}`).value = value;
    ws.getCell(`C${row}`).font = { size: 12 };
    ws.getRow(row).height = 26;
    row++;
  }

  // Verdict
  row += 1;
  ws.mergeCells(`A${row}:E${row}`);
  const verdictCell = ws.getCell(`A${row}`);
  const isDeployable = parseFloat(passRate) >= 90;
  const isConditional = parseFloat(passRate) >= 70;

  if (isDeployable) {
    verdictCell.value = '✅ VERDICT: READY FOR DEPLOYMENT';
    verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.pass } };
    verdictCell.font = { size: 16, bold: true, color: { argb: COLORS.passText } };
  } else if (isConditional) {
    verdictCell.value = '⚠️ VERDICT: CONDITIONAL — Review failures before deploying';
    verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.skip } };
    verdictCell.font = { size: 16, bold: true, color: { argb: COLORS.skipText } };
  } else {
    verdictCell.value = '❌ VERDICT: NOT READY FOR DEPLOYMENT';
    verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.fail } };
    verdictCell.font = { size: 16, bold: true, color: { argb: COLORS.failText } };
  }
  verdictCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(row).height = 50;

  // Failed tests list
  const failedTests = results.filter(r => r.status === 'FAIL');
  if (failedTests.length > 0) {
    row += 2;
    ws.mergeCells(`A${row}:E${row}`);
    ws.getCell(`A${row}`).value = '❌ FAILED TEST CASES — Requires Attention';
    ws.getCell(`A${row}`).font = { size: 14, bold: true, color: { argb: COLORS.failText } };
    ws.getRow(row).height = 30;
    row++;

    const fhRow = ws.getRow(row);
    fhRow.values = ['Test ID', 'Test Case', 'Category', 'Error', ''];
    fhRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: COLORS.headerText } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E53935' } };
    });
    row++;

    for (const ft of failedTests) {
      const fRow = ws.getRow(row);
      fRow.values = [ft.id, ft.name, ft.category, ft.error || 'N/A', ''];
      fRow.eachCell((cell) => {
        cell.border = { bottom: { style: 'thin', color: { argb: COLORS.border } } };
        cell.alignment = { wrapText: true };
      });
      row++;
    }
  }

  ws.columns = [
    { width: 12 }, { width: 45 }, { width: 18 }, { width: 40 }, { width: 5 },
  ];
}

module.exports = { generateExcelReport };
