
import { FormattedExport } from './formatters';

// Function to generate HTML content for the export
export const generateHtmlContent = (exportData: FormattedExport, style: 'pdf' | 'docx'): string => {
  const fontFamily = style === 'pdf' ? 'Arial, sans-serif' : "'Cambria', serif";
  const margin = style === 'pdf' ? '40px' : '2.5cm';
  
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${exportData.title}</title>
      <meta charset="utf-8">
      <style>
        body { font-family: ${fontFamily}; margin: ${margin}; }
        h1 { color: #333; }
        h2 { color: #555; margin-top: 20px; }
        p { margin-bottom: 15px; }
      </style>
    </head>
    <body>
      <h1>${exportData.title}</h1>
      <p><strong>Date:</strong> ${exportData.date}</p>
  `;
  
  if (exportData.sections) {
    exportData.sections.forEach((section) => {
      if (section.content) {
        htmlContent += `
          <h2>${section.name}</h2>
          <p>${section.content.replace(/\n/g, '<br>')}</p>
        `;
      }
    });
  }
  
  htmlContent += `
    </body>
    </html>
  `;
  
  return htmlContent;
};

// Function to generate CSV content for the export
export const generateCsvContent = (exportData: FormattedExport): string => {
  let csvContent = `"${exportData.title}"\n"Date: ${exportData.date}"\n\n`;
  
  if (exportData.sections) {
    exportData.sections.forEach((section) => {
      if (section.content) {
        // Clean quotes in content to avoid CSV format issues
        const cleanContent = section.content.replace(/"/g, '""');
        csvContent += `"${section.name}","${cleanContent}"\n`;
      }
    });
  }
  
  return csvContent;
};

// Function to create a file blob and trigger download
export const downloadFile = (content: string, filename: string, contentType: string): void => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Main export function
export const exportToFile = (
  format: "pdf" | "docx" | "xlsx",
  formData: any, 
  projectName: string,
  resourceType: string,
  exportData: FormattedExport
): void => {
  const resourceTypeSafe = resourceType.replace(/\s+/g, "_");
  const projectNameSafe = projectName.replace(/\s+/g, "_");
  const filename = `${resourceTypeSafe}_${projectNameSafe}.${format}`;
  
  switch (format) {
    case "pdf": {
      const htmlContent = generateHtmlContent(exportData, 'pdf');
      downloadFile(htmlContent, filename, "text/html");
      break;
    }
    case "docx": {
      const htmlContent = generateHtmlContent(exportData, 'docx');
      downloadFile(htmlContent, filename, "text/html");
      break;
    }
    case "xlsx": {
      const csvContent = generateCsvContent(exportData);
      downloadFile(csvContent, filename, "text/csv");
      break;
    }
  }
};
