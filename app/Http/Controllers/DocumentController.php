<?php

namespace App\Http\Controllers;

use App\Models\ProjectImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class DocumentController extends Controller
{
    /**
     * Download document from database
     */
    public function download($id)
    {
        $document = ProjectImage::findOrFail($id);
        
        if (!$document->document) {
            abort(404, 'Document not found in database');
        }
        
        // Check if it's base64 encoded data
        if (str_contains($document->document, 'data:') || $this->isBase64($document->document)) {
            // Handle base64 encoded data
            if (str_contains($document->document, ',')) {
                // Full data URL format: data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDB...
                $parts = explode(',', $document->document);
                $base64Data = $parts[1];
                $mimeType = explode(';', explode(':', $parts[0])[1])[0];
            } else {
                // Just base64 string
                $base64Data = $document->document;
                $mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            }
            
            $documentData = base64_decode($base64Data);
            
            // Get filename from document info or generate one
            $documentInfo = $document->document_info;
            $filename = $documentInfo['filename'] ?? ('document_' . $document->id . '.docx');
            
            return Response::make($documentData)
                ->header('Content-Type', $mimeType)
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Content-Length', strlen($documentData))
                ->header('Cache-Control', 'private, max-age=0, must-revalidate')
                ->header('Pragma', 'public')
                ->header('Expires', '0');
        } else {
            // Handle file path (backward compatibility)
            abort(404, 'File-based documents not supported');
        }
    }

    /**
     * Preview document as PDF
     */
    public function preview($id)
    {
        $document = ProjectImage::findOrFail($id);
        
        // Generate PDF preview on-demand
        if ($document->document) {
            $pdfData = $this->convertToPdf($document);
            return $this->servePdf($pdfData, $document->document_info['filename'] ?? 'document.pdf');
        }
        
        abort(404, 'Document not found');
    }

    /**
     * Convert Word document to PDF
     */
    private function convertToPdf($document)
    {
        try {
            // Extract base64 data from document
            $base64Data = $this->extractBase64Data($document->document);
            $wordData = base64_decode($base64Data);
            
            // Load Word document
            $tempWordFile = tempnam(sys_get_temp_dir(), 'word_doc_') . '.docx';
            file_put_contents($tempWordFile, $wordData);
            
            // Load with PhpWord
            $phpWord = IOFactory::load($tempWordFile);
            
            // Save as PDF using default PDF writer
            $tempPdfFile = tempnam(sys_get_temp_dir(), 'pdf_preview_') . '.pdf';
            $pdfWriter = IOFactory::createWriter($phpWord, 'PDF');
            $pdfWriter->save($tempPdfFile);
            
            // Read PDF data
            $pdfData = file_get_contents($tempPdfFile);
            
            // Clean up temp files
            unlink($tempWordFile);
            unlink($tempPdfFile);
            
            // Return base64 encoded PDF
            return base64_encode($pdfData);
            
        } catch (\Exception $e) {
            // Fallback: return base64 placeholder PDF
            return $this->generateFallbackPdf($document);
        }
    }

    /**
     * Extract base64 data from document field
     */
    private function extractBase64Data($document)
    {
        if (str_contains($document, ',')) {
            $parts = explode(',', $document);
            return $parts[1];
        }
        return $document;
    }

    /**
     * Serve PDF with proper headers
     */
    private function servePdf($pdfBase64, $filename)
    {
        $pdfData = base64_decode($pdfBase64);
        $pdfFilename = preg_replace('/\.(doc|docx)$/i', '.pdf', $filename);
        
        return Response::make($pdfData)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="' . $pdfFilename . '"')
            ->header('Content-Length', strlen($pdfData))
            ->header('Cache-Control', 'public, max-age=3600');
    }

    /**
     * Generate fallback PDF if conversion fails
     */
    private function generateFallbackPdf($document)
    {
        $documentInfo = $document->document_info;
        $filename = $documentInfo['filename'] ?? 'Unknown Document';
        
        // Simple PDF content
        $pdfContent = '%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(' . $filename . ') Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000256 00000 n 
0000000345 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
433
%%EOF';
        
        return base64_encode($pdfContent);
    }

    private function isBase64($string)
    {
        return base64_decode($string, true) !== false && base64_encode(base64_decode($string)) === $string;
    }
}
