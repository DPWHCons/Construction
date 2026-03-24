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
     * Check if string is valid base64
     */
    private function isBase64($string)
    {
        return base64_decode($string, true) !== false && base64_encode(base64_decode($string)) === $string;
    }
}
