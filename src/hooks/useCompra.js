import { useContext } from 'react'
import { CompraContext } from '../context/CompraContext.js'

export function useCompra() {
  return useContext(CompraContext)
}
