import pdfplumber
import io

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_PAGES = 20


def extract_text_from_pdf(file_bytes: bytes) -> str:
    if len(file_bytes) > MAX_FILE_SIZE:
        raise ValueError("File too large. Maximum size is 5MB.")

    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            if len(pdf.pages) == 0:
                raise ValueError("PDF has no pages.")
            if len(pdf.pages) > MAX_PAGES:
                raise ValueError(f"PDF too long. Maximum {MAX_PAGES} pages allowed.")

            pages_text = []
            for page in pdf.pages:
                text = page.extract_text()
                if text and text.strip():
                    pages_text.append(text.strip())

            if not pages_text:
                raise ValueError("No readable text found in PDF. Please ensure the PDF contains actual text (not scanned images).")

            return "\n\n".join(pages_text)
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Could not parse PDF: {str(e)}")
