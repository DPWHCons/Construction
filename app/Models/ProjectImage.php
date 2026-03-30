<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'document',
        'filename',
        'url',
        'caption',
        'is_archived',
        'archived_at',
        'document_date',
    ];

    protected $casts = [
        'is_archived' => 'boolean',
        'archived_at' => 'datetime',
        'document_date' => 'date',
    ];

    protected $appends = ['url'];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function getUrlAttribute()
    {
        // Check if document contains base64 data or file path
        if ($this->document && (str_contains($this->document, 'data:') || $this->isBase64($this->document))) {
            // Binary data stored - return route to download document from database
            return route('documents.download', $this->id);
        }
        
        // File path stored - return storage URL
        return $this->document ? '/storage/' . $this->document : null;
    }
    
    /**
     * Check if string is valid base64
     */
    private function isBase64($string)
    {
        return base64_decode($string, true) !== false && base64_encode(base64_decode($string)) === $string;
    }
    
    /**
     * Get document info for display
     */
    public function getDocumentInfoAttribute()
    {
        \Log::info('Document info called for ID: ' . $this->id);
        \Log::info('Filename from DB: ' . ($this->filename ?? 'NULL'));
        
        if ($this->document && (str_contains($this->document, 'data:') || $this->isBase64($this->document))) {
            // Binary data - extract file info
            $filename = $this->filename ?: 'Document';
            
            if (str_contains($this->document, ',')) {
                // Data URL format
                $parts = explode(',', $this->document);
                $mimeType = explode(';', explode(':', $parts[0])[1])[0];
            } else {
                // Base64 string - assume Word document
                $mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            }
            
            $result = [
                'filename' => $filename,
                'mime_type' => $mimeType,
                'size' => strlen(base64_decode($this->document)),
                'type' => 'word_document'
            ];
            
            \Log::info('Document info result: ', $result);
            return $result;
        }
        
        \Log::info('No document data found');
        return null;
    }
    
    private function getExtensionFromMimeType($mimeType)
    {
        $mimeToExt = [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
            'application/msword' => 'doc',
            'application/pdf' => 'pdf',
            'text/plain' => 'txt',
        ];
        
        return $mimeToExt[$mimeType] ?? 'docx';
    }
}
