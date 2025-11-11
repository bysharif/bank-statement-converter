# Enhanced Batch Upload UI - Implementation Plan

## Overview
Transform the current batch upload system into a sequential processing interface with:
- File listing table showing all uploaded documents
- Individual progress bars for each document (using shadcn/ui Progress component)
- Sequential processing (one file at a time)
- Realistic progress indicators
- Visual checkmark/tick when each file completes
- Process all documents until complete

## Current Architecture (What We Have)

### Existing Components
- ✅ `dashboard-upload.tsx` - Main upload component
- ✅ Progress component from shadcn/ui (already imported)
- ✅ Table component from shadcn/ui (available)
- ✅ `/api/process-pdfs` - Batch processing API (processes all files at once)

### Current Flow
1. User selects multiple files
2. All files sent to `/api/process-pdfs` at once
3. API processes all files in parallel
4. Single progress bar shows overall progress
5. Single result shown when complete

## New Architecture (What We'll Build)

### Component Structure
```
DashboardUpload
├── UploadZone (when no files selected)
│   └── Drag & drop / file input
└── ProcessingView (when files are processing)
    ├── FileListingTable
    │   ├── FileRow (for each file)
    │   │   ├── File info (name, size)
    │   │   ├── Progress bar
    │   │   ├── Status badge
    │   │   └── Checkmark icon
    └── ActionButtons
        ├── Cancel All
        └── Download All (when complete)
```

### New Data Model

```typescript
interface FileProcessingJob {
  id: string                    // Unique identifier
  file: File                     // Original file
  fileName: string               // Display name
  fileSize: number               // Size in bytes
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number               // 0-100
  startTime?: number             // Timestamp when processing started
  endTime?: number               // Timestamp when processing completed
  error?: string                 // Error message if failed
  result?: {
    bankName?: string
    transactionCount: number
    csvContent?: string
    preview?: any[]
    download?: any[]
  }
}

interface BatchState {
  files: FileProcessingJob[]     // All files in the batch
  currentIndex: number            // Index of file currently processing
  allCompleted: boolean           // True when all files done
  hasErrors: boolean              // True if any file failed
}
```

## Implementation Steps

### Step 1: Update State Management
**File:** `src/components/dashboard/dashboard-upload.tsx`

```typescript
// Replace single currentJob with batch state
const [batchState, setBatchState] = useState<BatchState | null>(null)

// Helper to update individual file in batch
const updateFileStatus = (
  fileId: string,
  updates: Partial<FileProcessingJob>
) => {
  setBatchState(prev => {
    if (!prev) return null
    return {
      ...prev,
      files: prev.files.map(f =>
        f.id === fileId ? { ...f, ...updates } : f
      )
    }
  })
}
```

### Step 2: Create File Listing Table Component
**File:** `src/components/dashboard/dashboard-upload.tsx` (internal component)

```typescript
function FileListingTable({ files }: { files: FileProcessingJob[] }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">Status</TableHead>
            <TableHead>File Name</TableHead>
            <TableHead className="w-[120px]">Size</TableHead>
            <TableHead className="w-[300px]">Progress</TableHead>
            <TableHead className="w-[120px]">Transactions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <FileRow key={file.id} file={file} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

### Step 3: Create File Row Component
**File:** `src/components/dashboard/dashboard-upload.tsx` (internal component)

```typescript
function FileRow({ file }: { file: FileProcessingJob }) {
  const getStatusIcon = () => {
    switch (file.status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-600 animate-spin" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = () => {
    switch (file.status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-600">Complete</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-600">Processing</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-600">Failed</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <TableRow className={
      file.status === 'completed' ? 'bg-green-50' :
      file.status === 'error' ? 'bg-red-50' :
      file.status === 'processing' ? 'bg-blue-50' :
      ''
    }>
      <TableCell>{getStatusIcon()}</TableCell>
      <TableCell>
        <div className="font-medium">{file.fileName}</div>
        {file.error && (
          <div className="text-xs text-red-600 mt-1">{file.error}</div>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatFileSize(file.fileSize)}
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <Progress value={file.progress} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {file.progress}%
          </div>
        </div>
      </TableCell>
      <TableCell className="text-center">
        {file.result?.transactionCount || '-'}
      </TableCell>
    </TableRow>
  )
}
```

### Step 4: Implement Sequential Processing Logic
**File:** `src/components/dashboard/dashboard-upload.tsx`

```typescript
const processFilesSequentially = async (files: File[]) => {
  // Initialize batch state with all files as pending
  const fileJobs: FileProcessingJob[] = files.map((file, index) => ({
    id: `${Date.now()}-${index}`,
    file,
    fileName: file.name,
    fileSize: file.size,
    status: 'pending',
    progress: 0,
  }))

  setBatchState({
    files: fileJobs,
    currentIndex: 0,
    allCompleted: false,
    hasErrors: false,
  })

  // Process each file sequentially
  for (let i = 0; i < fileJobs.length; i++) {
    const job = fileJobs[i]

    try {
      // Update state: mark as processing
      updateFileStatus(job.id, {
        status: 'processing',
        progress: 10,
        startTime: Date.now()
      })

      // Simulate realistic progress updates during processing
      const progressInterval = setInterval(() => {
        updateFileStatus(job.id, {
          progress: Math.min(job.progress + Math.random() * 15, 90)
        })
      }, 500)

      // Create FormData for single file
      const formData = new FormData()
      formData.append('files', job.file)

      // Call API to process this single file
      const response = await fetch('/api/process-pdfs', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process file')
      }

      const result = await response.json()

      // Update state: mark as completed
      updateFileStatus(job.id, {
        status: 'completed',
        progress: 100,
        endTime: Date.now(),
        result: {
          bankName: 'AI-Detected',
          transactionCount: result.totalTransactions || 0,
          csvContent: result.csvContent,
          preview: result.preview,
          download: result.download,
        }
      })

    } catch (error: any) {
      console.error(`Error processing ${job.fileName}:`, error)

      // Update state: mark as error
      updateFileStatus(job.id, {
        status: 'error',
        progress: 0,
        error: error.message || 'Failed to process file',
        endTime: Date.now()
      })

      setBatchState(prev => prev ? { ...prev, hasErrors: true } : null)
    }

    // Update current index
    setBatchState(prev => prev ? { ...prev, currentIndex: i + 1 } : null)
  }

  // Mark all as completed
  setBatchState(prev => prev ? { ...prev, allCompleted: true } : null)
}
```

### Step 5: Update File Selection Handler
**File:** `src/components/dashboard/dashboard-upload.tsx`

```typescript
const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []).filter(f => f.type === 'application/pdf')

  if (files.length === 0) {
    return
  }

  if (files.length > 10) {
    alert('Maximum 10 files allowed at once')
    return
  }

  // Start sequential processing
  processFilesSequentially(files)
}, [])
```

### Step 6: Create Processing View UI
**File:** `src/components/dashboard/dashboard-upload.tsx`

```typescript
// Add to render logic (replacing current processing view)
if (batchState) {
  const { files, allCompleted, hasErrors } = batchState
  const completedCount = files.filter(f => f.status === 'completed').length
  const totalCount = files.length
  const hasAnyCompleted = completedCount > 0

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              {allCompleted ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Batch Processing Complete
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5 text-blue-600 animate-spin" />
                  Processing Files ({completedCount}/{totalCount})
                </>
              )}
            </CardTitle>
            <CardDescription>
              {allCompleted
                ? `Successfully processed ${completedCount} of ${totalCount} files`
                : `Processing your bank statements sequentially...`
              }
            </CardDescription>
          </div>
          <Badge className={`text-sm px-3 py-1 ${
            allCompleted
              ? hasErrors ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
              : 'bg-blue-100 text-blue-600'
          }`}>
            {completedCount}/{totalCount} Complete
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* File Listing Table */}
        <FileListingTable files={files} />

        {/* Overall Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="text-sm text-muted-foreground">Total Files</div>
            <div className="text-2xl font-bold">{totalCount}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Completed</div>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total Transactions</div>
            <div className="text-2xl font-bold">
              {files.reduce((sum, f) => sum + (f.result?.transactionCount || 0), 0)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setBatchState(null)}
            disabled={!allCompleted}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload More Files
          </Button>
          {hasAnyCompleted && (
            <Button
              className="flex-1 bg-gradient-to-r from-uk-blue-600 to-uk-blue-700"
              onClick={handleDownloadAll}
            >
              <Download className="mr-2 h-4 w-4" />
              Download All CSVs
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### Step 7: Implement Download All Function
**File:** `src/components/dashboard/dashboard-upload.tsx`

```typescript
const handleDownloadAll = () => {
  if (!batchState) return

  const completedFiles = batchState.files.filter(f => f.status === 'completed')

  if (completedFiles.length === 0) {
    alert('No files to download')
    return
  }

  // Option 1: Download as separate CSV files
  completedFiles.forEach((file) => {
    if (!file.result?.csvContent) return

    const blob = new Blob([file.result.csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.fileName.replace('.pdf', '.csv')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  })

  // Option 2: Combine all into single CSV (alternative)
  // const allTransactions = completedFiles.flatMap(f => f.result?.download || [])
  // const combinedCSV = generateBatchCSV(allTransactions)
  // downloadCSV(combinedCSV, 'combined-statements.csv')
}
```

## Progress Simulation Strategy

To show realistic progress during processing:

1. **Initial (0-10%)**: Set immediately when file processing starts
2. **Upload Phase (10-30%)**: Simulated progress while API call is in flight
3. **Processing Phase (30-90%)**: Incremental updates every 500ms
4. **Completion (90-100%)**: Set when API response received

```typescript
// Realistic progress updates
const simulateProgress = (fileId: string, startProgress: number, endProgress: number, duration: number) => {
  const steps = 10
  const increment = (endProgress - startProgress) / steps
  const interval = duration / steps

  let current = startProgress
  const progressInterval = setInterval(() => {
    current = Math.min(current + increment + Math.random() * 5, endProgress)
    updateFileStatus(fileId, { progress: Math.round(current) })
  }, interval)

  return progressInterval
}
```

## Visual Design Enhancements

### Color Coding
- **Pending**: Gray with outline
- **Processing**: Blue with pulsing animation
- **Completed**: Green with checkmark
- **Error**: Red with X icon

### Animations
- Spin animation for processing status icons
- Smooth progress bar transitions
- Row highlight on status change
- Checkmark fade-in on completion

### Responsive Design
- Stack table columns on mobile
- Hide less important columns (size, transactions) on small screens
- Maintain usability on all devices

## Testing Checklist

- [ ] Upload single file - processes correctly
- [ ] Upload multiple files (2-5) - all process sequentially
- [ ] Upload maximum (10 files) - handles gracefully
- [ ] File processing error - shows error state properly
- [ ] Mixed success/failure - displays both states
- [ ] Progress bars update smoothly
- [ ] Checkmarks appear on completion
- [ ] Download individual CSV works
- [ ] Download all CSVs works
- [ ] Cancel processing (if implemented)
- [ ] Database records created for each file
- [ ] Metrics update correctly

## Performance Considerations

1. **API Rate Limiting**: Sequential processing prevents overwhelming the API
2. **Memory Management**: Clear file buffers after processing
3. **Progress Updates**: Limit to avoid excessive re-renders (use throttling)
4. **Large Files**: Show file size warnings before processing
5. **Concurrent Uploads**: Only one batch at a time

## Future Enhancements (Post-MVP)

- Pause/Resume functionality
- Retry failed files
- Drag-to-reorder processing queue
- Estimated time remaining
- Processing statistics (avg time per file)
- Export processing report
- Batch download as ZIP file
- Real-time progress from server (WebSocket/SSE)

## Estimated Implementation Time

- Step 1-2 (State & Table): 1 hour
- Step 3-4 (Row Component & Sequential Logic): 1.5 hours
- Step 5-6 (Handlers & UI): 1 hour
- Step 7 (Download All): 30 minutes
- Testing & Polish: 1 hour
- **Total: ~5 hours**

## Dependencies

All required components already available:
- ✅ shadcn/ui Progress component
- ✅ shadcn/ui Table component
- ✅ shadcn/ui Badge component
- ✅ lucide-react icons
- ✅ /api/process-pdfs endpoint

## Success Criteria

1. ✅ Files listed in a table before processing
2. ✅ Each file has its own progress bar
3. ✅ Files process one by one (sequential)
4. ✅ Progress bars show realistic progress
5. ✅ Checkmarks appear when files complete
6. ✅ All files process to completion
7. ✅ Download all CSVs functionality works
8. ✅ Error handling for failed files
9. ✅ Database records created for each conversion
10. ✅ Professional, polished UI/UX

---

**Last Updated**: November 11, 2025
**Status**: Ready to implement
**Blocker**: None - all dependencies available
