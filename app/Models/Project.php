<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Helpers\CurrencyHelper;

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
        'is_archive',
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
        'is_archive' => 'boolean',
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

    // Note: This relationship references tables created by migration 2026_03_05_025439
    // but was never fully implemented. Using AssignedEngineer model instead.
    // public function engineers(): BelongsToMany { ... }
    // public function projectEngineers(): HasMany { ... }

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

    // Accessors for formatted currency values
    public function getFormattedProjectCostAttribute()
    {
        return CurrencyHelper::formatPeso($this->project_cost);
    }

    public function getFormattedRevisedProjectCostAttribute()
    {
        return CurrencyHelper::formatPeso($this->revised_project_cost);
    }

    public function getFormattedProgramAmountAttribute()
    {
        return CurrencyHelper::formatPeso($this->program_amount);
    }

    // Make formatted attributes visible in JSON/Array serialization
    protected $appends = [
        'formatted_project_cost',
        'formatted_revised_project_cost',
        'formatted_program_amount'
    ];
}