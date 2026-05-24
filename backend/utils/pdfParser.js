const fs = require('fs');

/**
 * Extracts text from a PDF file using pdfjs-dist, falling back to pdf-parse on failure.
 * @param {string} filePath - Absolute path to the PDF file.
 * @returns {Promise<string>} Extracted text.
 */
async function extractTextFromPDF(filePath) {
    try {
        const data = new Uint8Array(fs.readFileSync(filePath));
        // Dynamically import pdfjs-dist legacy ES module
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
        
        const loadingTask = pdfjsLib.getDocument({
            data,
            useSystemFonts: true
        });
        const pdf = await loadingTask.promise;
        
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(" ");
            fullText += pageText + "\n";
        }
        return fullText;
    } catch (error) {
        console.warn('pdfjs-dist parsing failed, falling back to pdf-parse:', error);
        
        const pdfParse = require('pdf-parse');
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    }
}

module.exports = { extractTextFromPDF };
