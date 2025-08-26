import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: any) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })

    if (error) throw error

    // Sync user with our backend database
    if (data.user) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/sync-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            supabaseId: data.user.id,
            email: data.user.email,
            name: metadata?.full_name || data.user.email?.split('@')[0],
            age: metadata?.age || 18,
            role: metadata?.role || 'PLAYER',
            position: metadata?.position,
            team: metadata?.team
          })
        })

        if (!response.ok) {
          console.error('Failed to sync user with backend:', await response.text())
        }
      } catch (syncError) {
        console.error('Error syncing user with backend:', syncError)
      }

      // Also try to create a Supabase profile for compatibility
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: metadata?.full_name,
          age: metadata?.age,
          position: metadata?.position,
          team: metadata?.team,
          role: metadata?.role || 'PLAYER',
        })

      if (profileError) {
        console.error('Error creating Supabase profile:', profileError)
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Sync user with backend on sign in (in case they don't exist yet)
    if (data.user) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/sync-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            supabaseId: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
            age: data.user.user_metadata?.age || 18,
            role: data.user.user_metadata?.role || 'PLAYER',
            position: data.user.user_metadata?.position,
            team: data.user.user_metadata?.team
          })
        })

        if (!response.ok) {
          console.error('Failed to sync user with backend:', await response.text())
        }
      } catch (syncError) {
        console.error('Error syncing user with backend:', syncError)
      }
    }

    navigate('/dashboard')
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    navigate('/')
  }

  const updateProfile = async (updates: any) => {
    if (!user) throw new Error('No user logged in')

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) throw error
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
}