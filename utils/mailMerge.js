import fs from 'fs/promises';
import path from 'path';
import logger from './logger.js';
import { PDFDocument } from 'pdf-lib';
import puppeteer from 'puppeteer';

export async function performMailMerge(htmlTemplate, fields, proposalPdfPath, outputPath) {
  try {
    logger.info(`Starting mail merge. Proposal PDF: ${proposalPdfPath}, Output: ${outputPath}`);
    
    // Replace placeholders in HTML with actual data
    let mergedHtml = htmlTemplate;
    for (const [key, value] of Object.entries(fields)) {
      mergedHtml = mergedHtml.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    // Convert merged HTML to PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(mergedHtml);
    const mergedPdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    // Combine merged PDF with proposal PDF
    const pdfDoc = await PDFDocument.create();
    const mergedPdf = await PDFDocument.load(mergedPdfBuffer);
    const proposalPdf = await PDFDocument.load(await fs.readFile(proposalPdfPath));

    const copiedPages = await pdfDoc.copyPages(mergedPdf, mergedPdf.getPageIndices());
    copiedPages.forEach((page) => pdfDoc.addPage(page));

    const proposalPages = await pdfDoc.copyPages(proposalPdf, proposalPdf.getPageIndices());
    proposalPages.forEach((page) => pdfDoc.addPage(page));

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);

    logger.info('Mail merge completed successfully');
    return outputPath;
  } catch (error) {
    console.error('Error performing mail merge:', error);
    logger.error('Error performing mail merge:', error);
    throw new Error(`Mail merge failed: ${error.message}`);
  }
}
