<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'date_started',
        'project_cost',
        'revised_project_cost',
        'program_amount',
        'status',
        'completion_date',
        'category_id',
        'project_year',
        'project_id', // Client project identifier
        'contract_id', // Contract number
    ];

    protected $casts = [
        'date_started' => 'date',
        'completion_date' => 'date',
        'project_cost' => 'decimal:2',
        'revised_project_cost' => 'decimal:2',
        'program_amount' => 'decimal:2',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProjectImage::class)->where('is_archived', false);
    }

    public function assignedEngineers(): HasMany
    {
        return $this->hasMany(AssignedEngineer::class);
    }

    public function engineers(): BelongsToMany
    {
        return $this->belongsToMany(Engineer::class, 'project_engineers')
            ->withPivot('title_id')
            ->withTimestamps();
    }

    public function projectEngineers(): HasMany
    {
        return $this->hasMany(ProjectEngineer::class);
    }

    public function scope(): HasMany
    {
        return $this->hasMany(ProjectScope::class);
    }

    public function progress(): HasMany
    {
        return $this->hasMany(ProjectProgress::class);
    }

    public function remarks(): HasMany
    {
        return $this->hasMany(ProjectRemark::class);
    }
}