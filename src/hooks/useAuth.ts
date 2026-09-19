import { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { authService } from "../services/auth";

export function useAuth() {
  const { session, loading: sessionLoading } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      return await authService.signIn(email, password);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      return await authService.signUp(email, password);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session,
    loading: loading || sessionLoading,
    signIn,
    signUp,
    signOut,
  };
}
