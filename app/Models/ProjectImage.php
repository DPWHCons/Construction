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
        'image_path',
        'url',
        'caption',
        'is_archived',
        'archived_at',
    ];

    protected $casts = [
        'is_archived' => 'boolean',
        'archived_at' => 'datetime',
    ];

    protected $appends = ['url', 'base64'];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function getUrlAttribute()
    {
        // Check if image_path contains base64 data (starts with data: or is base64 string)
        if ($this->image_path && (str_contains($this->image_path, 'data:') || $this->isBase64($this->image_path))) {
            // Binary data stored - return route to display image from database
            return route('images.show', $this->id);
        }
        
        // File path stored - return storage URL
        return $this->image_path ? '/storage/' . $this->image_path : null;
    }
    
    /**
     * Check if string is valid base64
     */
    private function isBase64($string)
    {
        return base64_decode($string, true) !== false && base64_encode(base64_decode($string)) === $string;
    }
    
    /**
     * Get image data as base64 for direct embedding
     */
    public function getBase64Attribute()
    {
        if ($this->image_path && (str_contains($this->image_path, 'data:') || $this->isBase64($this->image_path))) {
            // Binary data - handle base64 conversion
            if (str_contains($this->image_path, ',')) {
                // Already a data URL format
                return $this->image_path;
            } else {
                // Just base64 string, need to detect MIME type
                $binaryData = base64_decode($this->image_path);
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mimeType = finfo_buffer($finfo, $binaryData);
                finfo_close($finfo);
                
                return 'data:' . $mimeType . ';base64,' . $this->image_path;
            }
        }
        return null;
    }
}
