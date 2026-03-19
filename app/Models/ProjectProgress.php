<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectProgress extends Model
{
    protected $fillable = [
        'project_id',
        'target_planned',
        'target_revised',
        'target_actual',
        'physical_accomplishment_planned',
        'physical_accomplishment_revised',
        'physical_accomplishment_actual',
        'target_start_planned',
        'target_start_revised',
        'target_start_actual',
        'target_completion_planned',
        'target_completion_revised',
        'target_completion_actual',
        'completion_percentage_planned',
        'completion_percentage_actual',
        'slippage',
    ];

    protected $casts = [
        'target_planned' => 'decimal:2',
        'target_revised' => 'decimal:2',
        'target_actual' => 'decimal:2',
        'physical_accomplishment_planned' => 'decimal:2',
        'physical_accomplishment_revised' => 'decimal:2',
        'physical_accomplishment_actual' => 'decimal:2',
        'target_start_planned' => 'date',
        'target_start_revised' => 'date',
        'target_start_actual' => 'date',
        'target_completion_planned' => 'date',
        'target_completion_revised' => 'date',
        'target_completion_actual' => 'date',
        'completion_percentage_planned' => 'decimal:2',
        'completion_percentage_actual' => 'decimal:2',
        'slippage' => 'decimal:2',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
