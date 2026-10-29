import { createContext } from 'react'

// Sesión del usuario. El valor lo provee AuthProvider y se lee con el hook useAuth.
export const AuthContext = createContext(null)
