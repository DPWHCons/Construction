<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectProgress extends Model
{
    protected $fillable = [
        'project_id',
        'target_actual',
        'target_start_actual',
        'target_completion_actual',
    ];

    protected $casts = [
        'target_actual' => 'integer',
        'target_start_actual' => 'date',
        'target_completion_actual' => 'date',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
