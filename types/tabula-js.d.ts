declare module 'tabula-js' {
  interface TabulaOptions {
    pages?: string | number[]
    area?: string[]
    columns?: boolean
    silent?: boolean
    guess?: boolean
    lattice?: boolean
    stream?: boolean
    password?: string
  }

  function tabula(
    buffer: Buffer | string,
    options?: TabulaOptions
  ): Promise<any[][]>

  export = tabula
}