declare module 'pdf2json' {
  interface PDFField {
    x: number
    y: number
    w: number
    h: number
    R: Array<{
      T: string
    }>
  }

  interface PDFPage {
    Width: number
    Height: number
    Fields: PDFField[]
    Texts: Array<{
      x: number
      y: number
      w: number
      sw: number
      A: string
      R: Array<{
        T: string
        S: number
        TS: Array<number>
      }>
    }>
  }

  interface PDFData {
    Pages: PDFPage[]
    Meta: {
      PDFFormatVersion: string
      IsAcroFormPresent: boolean
      IsXFAPresent: boolean
      Title: string
      Author: string
      Subject: string
      Creator: string
      Producer: string
      CreationDate: string
      ModDate: string
    }
  }

  class PDFParser {
    constructor()
    parseBuffer(buffer: Buffer): Promise<PDFData>
    on(event: 'pdfParser_dataError', callback: (error: any) => void): void
    on(event: 'pdfParser_dataReady', callback: (data: PDFData) => void): void
  }

  export = PDFParser
}