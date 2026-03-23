<?php

namespace App\Http\Controllers;

use App\Models\ProjectImage;
use Illuminate\Http\Request;

class ImageController extends Controller
{
    /**
     * Display image from database
     */
    public function show($id)
    {
        $image = ProjectImage::findOrFail($id);
        
        // Check if image_path contains base64 data or file path
        if (!$image->image_path) {
            abort(404, 'Image not found in database');
        }
        
        // Check if it's base64 encoded data (starts with data: or is base64 string)
        if (str_contains($image->image_path, 'data:') || $this->isBase64($image->image_path)) {
            // Handle base64 encoded data
            if (str_contains($image->image_path, ',')) {
                // Full data URL format: data:image/jpeg;base64,/9j/4AAQSkZJRgABA...
                $parts = explode(',', $image->image_path);
                $base64Data = $parts[1];
                $mimeType = explode(';', explode(':', $parts[0])[1])[0];
            } else {
                // Just base64 string, need to detect MIME type
                $base64Data = $image->image_path;
                $binaryData = base64_decode($base64Data);
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mimeType = finfo_buffer($finfo, $binaryData);
                finfo_close($finfo);
            }
            
            $imageData = base64_decode($base64Data);
        } else {
            // Handle file path (backward compatibility)
            abort(404, 'File-based images not supported');
        }
        
        return response($imageData)
            ->header('Content-Type', $mimeType)
            ->header('Content-Length', strlen($imageData))
            ->header('Cache-Control', 'public, max-age=31536000') // Cache for 1 year
            ->header('Etag', md5($imageData));
    }
    
    private function isBase64($string)
    {
        // Check if string is valid base64
        return base64_decode($string, true) !== false && base64_encode(base64_decode($string)) === $string;
    }
}
