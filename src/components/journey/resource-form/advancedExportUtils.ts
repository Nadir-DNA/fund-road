import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { FormattedExport } from './formatters';

// Generate PDF using jsPDF
export const generatePDF = async (
  exportData: FormattedExport,
  title: string,
  resourceType: string
) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  const lineHeight = 7;
  let currentY = margin + 10;

  // Title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(exportData.title, margin, currentY);
  currentY += lineHeight * 2;

  // Date
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Date: ${exportData.date}`, margin, currentY);
  currentY += lineHeight * 2;

  // Sections
  if (exportData.sections) {
    for (const section of exportData.sections) {
      // Check if we need a new page
      if (currentY > pageHeight - margin * 3) {
        pdf.addPage();
        currentY = margin + 10;
      }

      // Section title
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(section.name, margin, currentY);
      currentY += lineHeight;

      // Section content
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      if (section.content) {
        const lines = pdf.splitTextToSize(section.content, pageWidth - margin * 2);
        for (const line of lines) {
          if (currentY > pageHeight - margin * 2) {
            pdf.addPage();
            currentY = margin + 10;
          }
          pdf.text(line, margin, currentY);
          currentY += lineHeight;
        }
      }
      
      currentY += lineHeight; // Space between sections
    }
  }

  // Save the PDF
  const filename = `${resourceType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};

// Generate Word document using docx
export const generateWord = async (
  exportData: FormattedExport,
  title: string,
  resourceType: string
) => {
  const children = [];

  // Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: exportData.title,
          bold: true,
          size: 32
        })
      ],
      heading: HeadingLevel.TITLE
    })
  );

  // Date
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Date: ${exportData.date}`,
          italics: true
        })
      ]
    })
  );

  // Empty line
  children.push(new Paragraph({ children: [] }));

  // Sections
  if (exportData.sections) {
    for (const section of exportData.sections) {
      // Section heading
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.name,
              bold: true,
              size: 24
            })
          ],
          heading: HeadingLevel.HEADING_1
        })
      );

      // Section content
      if (section.content) {
        // Split content by lines and create paragraphs
        const lines = section.content.split('\n');
        for (const line of lines) {
          if (line.trim()) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: line.trim()
                  })
                ]
              })
            );
          }
        }
      }

      // Empty line between sections
      children.push(new Paragraph({ children: [] }));
    }
  }

  const doc = new Document({
    sections: [{
      children
    }]
  });

  // Generate and download
  const buffer = await Packer.toBlob(doc);
  const url = URL.createObjectURL(buffer);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${resourceType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};