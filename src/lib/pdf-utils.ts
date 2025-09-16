// PDF page detection utility
export async function detectPDFPages(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = function() {
      try {
        const typedArray = new Uint8Array(reader.result as ArrayBuffer)
        const text = String.fromCharCode.apply(null, Array.from(typedArray))

        // Simple PDF page count detection
        // Look for /Count entries in the PDF structure
        const countMatches = text.match(/\/Count\s+(\d+)/g)

        if (countMatches && countMatches.length > 0) {
          // Extract the highest count value found
          const counts = countMatches.map(match => {
            const number = match.match(/(\d+)/)
            return number ? parseInt(number[1]) : 0
          })
          resolve(Math.max(...counts))
        } else {
          // Fallback: count page objects
          const pageMatches = text.match(/\/Page\b/g)
          resolve(pageMatches ? pageMatches.length : 1)
        }
      } catch (error) {
        // If we can't detect pages, assume it's a single page
        resolve(1)
      }
    }

    reader.onerror = () => reject(new Error('Failed to read PDF file'))
    reader.readAsArrayBuffer(file)
  })
}

export function shouldRequireSignup(file: File, pageCount: number): boolean {
  // Require signup for PDFs with more than 5 pages
  if (file.type === 'application/pdf' && pageCount > 5) {
    return true
  }
  return false
}