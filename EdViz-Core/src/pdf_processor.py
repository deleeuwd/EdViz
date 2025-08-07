import pdfplumber
import re
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class PDFProcessor:
    def __init__(self):
        self.header_footer_patterns = [
            r'Page \d+ of \d+',
            r'\d+',
            r'©.*',
            r'Confidential.*',
            r'Draft.*'
        ]

    def clean_text(self, text: str) -> str:
        """Clean extracted text by removing headers, footers, and extra whitespace"""
        # Remove headers and footers
        for pattern in self.header_footer_patterns:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE | re.MULTILINE)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        
        return text

    def extract_text(self, pdf_path: Path) -> str:
        """Extract and clean text from PDF file"""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                text = ""
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                
                # Clean the extracted text
                cleaned_text = self.clean_text(text)
                logger.info(f"Successfully extracted text from {pdf_path}")
                return cleaned_text
                
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise

    def process_pdf(self, pdf_path: Path) -> dict:
        """Process PDF file and return extracted information"""
        try:
            text = self.extract_text(pdf_path)
            return {
                "text": text,
                "num_pages": len(pdfplumber.open(pdf_path).pages),
                "file_name": pdf_path.name
            }
        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}")
            raise 