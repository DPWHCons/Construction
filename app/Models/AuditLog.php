<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'resource_type',
        'resource_id',
        'resource_name',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Log an audit event
     */
    public static function log(
        string $action,
        string $resourceType,
        ?int $resourceId = null,
        ?string $resourceName = null,
        ?array $oldValues = null,
        ?array $newValues = null
    ): void {
        $user = auth()->user();
        
        if (!$user) {
            return; // Don't log if no authenticated user
        }

        static::create([
            'user_id' => $user->id,
            'action' => $action,
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'resource_name' => $resourceName,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Get human-readable action description
     */
    public function getActionDescriptionAttribute(): string
    {
        $actions = [
            'created' => 'Created',
            'updated' => 'Updated',
            'deleted' => 'Deleted',
            'archived' => 'Archived',
            'restored' => 'Restored',
            'uploaded' => 'Uploaded',
            'permanent_delete' => 'Permanently Deleted',
        ];

        return $actions[$this->action] ?? ucfirst($this->action);
    }

    /**
     * Get full description of the audit event
     */
    public function getFullDescriptionAttribute(): string
    {
        return "{$this->actionDescription} {$this->resource_type}" . 
               ($this->resource_name ? " \"{$this->resource_name}\"" : "");
    }
}
