<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProjectExportController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ArchiveController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ContractorController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DebugController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/landing', [ProjectController::class, 'landing'])->name('landing');

Route::get('/', function () {
    return redirect()->route('login');
});

// Debug routes (temporary for debugging)
Route::get('/test-db', [DebugController::class, 'testDatabase']);
Route::post('/test-image-upload', [DebugController::class, 'testImageUpload']);
Route::get('/test-upload', function () {
    return view('test_upload');
});

// Image serving route (publicly accessible for display)
Route::get('/images/{id}', [ImageController::class, 'show'])->name('images.show');

// Document download route (publicly accessible for download)
Route::get('/documents/{id}/download', [DocumentController::class, 'download'])->name('documents.download');

Route::middleware(['auth', 'session.activity'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Category Routes
    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::get('/categories/create', [CategoryController::class, 'create'])->name('categories.create');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::get('/categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
    Route::patch('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::post('/categories/{category}/archive', [CategoryController::class, 'archive'])->name('categories.archive');
    Route::post('/categories/{category}/restore', [CategoryController::class, 'restore'])->name('categories.restore');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
});

Route::middleware(['auth', 'session.activity'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Project Export Routes
    Route::get('/projects/export', [ProjectExportController::class, 'export'])->name('projects.export');
    Route::post('/projects/import', [ProjectExportController::class, 'import'])->name('projects.import');
    
    // Project CRUD Routes
    Route::resource('projects', ProjectController::class);
    Route::post('/projects/{id}/archive', [ProjectController::class, 'archiveProject'])->name('projects.archive');
    Route::post('/projects/{id}/unarchive', [ProjectController::class, 'unarchiveProject'])->name('projects.unarchive');

    // Contractor Routes
    Route::resource('contractors', ContractorController::class)->parameters([
        'contractors' => 'contractorName'
    ]);
    Route::post('/contractors/{contractorName}/archive', [ContractorController::class, 'archive'])->name('contractors.archive');
    Route::post('/contractors/{contractorName}/restore', [ContractorController::class, 'restore'])->name('contractors.restore');

    // Gallery Routes
    Route::get('/gallery', [GalleryController::class, 'index'])->name('gallery.index');

    // Archive Routes
    Route::get('/archive', [ArchiveController::class, 'index'])->name('archive.index');
    Route::post('/archive/restore', [ProjectController::class, 'restoreImages'])->name('archive.restore');
    Route::post('/archive/permanent-delete', [ProjectController::class, 'permanentDeleteImages'])->name('archive.permanent-delete');
    
    // Project Archive Routes
    Route::post('/archive/projects/{id}/restore', [ArchiveController::class, 'restoreProject'])->name('archive.projects.restore');
    Route::delete('/archive/projects/{id}', [ArchiveController::class, 'deleteProject'])->name('archive.projects.delete');
    
    // Image Archive Routes
    Route::post('/archive/images/{id}/restore', [ArchiveController::class, 'restoreImage'])->name('archive.images.restore');
    Route::delete('/archive/images/{id}', [ArchiveController::class, 'deleteImage'])->name('archive.images.delete');
    
    // Contractor Archive Routes
    Route::post('/archive/contractors/{name}/restore', [ArchiveController::class, 'restoreContractor'])->name('archive.contractors.restore');
    Route::delete('/archive/contractors/{name}', [ArchiveController::class, 'deleteContractor'])->name('archive.contractors.delete');
    
    // Bulk Archive Operations
    Route::post('/archive/categories/restore-all', [ArchiveController::class, 'restoreAllCategories'])->name('archive.categories.restore-all');
    Route::post('/archive/categories/delete-all', [ArchiveController::class, 'deleteAllCategories'])->name('archive.categories.delete-all');
    Route::post('/archive/categories/{id}/restore', [ArchiveController::class, 'restoreCategory'])->name('archive.categories.restore');
    Route::delete('/archive/categories/{id}', [ArchiveController::class, 'deleteCategory'])->name('archive.categories.delete');
    Route::post('/archive/projects/restore-images', [ArchiveController::class, 'restoreProjectImages'])->name('archive.projects.restore-images');
    Route::post('/archive/projects/delete-images', [ArchiveController::class, 'deleteProjectImages'])->name('archive.projects.delete-images');
    
    Route::post('/archive/contractors/restore-all', [ArchiveController::class, 'restoreAllContractors'])->name('archive.contractors.restore-all');
    Route::post('/archive/contractors/delete-all', [ArchiveController::class, 'deleteAllContractors'])->name('archive.contractors.delete-all');
    Route::post('/archive/projects/restore-contractors', [ArchiveController::class, 'restoreProjectContractors'])->name('archive.projects.restore-contractors');
    Route::post('/archive/projects/delete-contractors', [ArchiveController::class, 'deleteProjectContractors'])->name('archive.projects.delete-contractors');
    
    // API Route for archiving images
    Route::post('/api/archive-images', [ProjectController::class, 'archiveImages'])->name('archive.images');
});

require __DIR__.'/auth.php';
