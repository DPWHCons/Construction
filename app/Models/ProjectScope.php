<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectScope extends Model
{
    protected $fillable = [
        'project_id',
        'duration_cd',
        'project_engineer',
        'contractor_name',
        'unit_of_measure',
        'scope_of_work_main',
    ];

    protected $casts = [
        'duration_cd' => 'integer',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
