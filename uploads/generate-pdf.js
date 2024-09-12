import PDFDocument from 'pdfkit';
import fs from 'fs';

// Function to generate PDF for the job
function generateJobPDF(jobDetails, outputPath) {
  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(outputPath));

  doc.fontSize(20).text('Scope of Work', {
    align: 'center',
  });

  doc.moveDown();
  doc.fontSize(14).text(`Job Title: ${jobDetails.jobTitle}`);
  doc.text(`Building: ${jobDetails.building}`);
  doc.text(`Vendor: ${jobDetails.vendor}`);
  doc.text(`Details: ${jobDetails.requestDetails}`);
  doc.text(`Vendor Email: ${jobDetails.vendorEmail}`);

  doc.end();
}

// Sample data based on the job created earlier
const jobDetails = {
  jobTitle: 'Security System Upgrade',
  vendor: 'SecureTech LLC',
  building: 'Building A',
  requestDetails: 'Upgrade all security cameras to 4K resolution',
  vendorEmail: 'signer@securetech.com',
};

// Output path where the PDF will be saved
const outputPath = 'uploads/job_scope_of_work.pdf';

// Generate the PDF
generateJobPDF(jobDetails, outputPath);

console.log(`PDF generated and saved to ${outputPath}`);