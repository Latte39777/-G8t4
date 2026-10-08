import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { AppMode, Family, FamilyMember, Profile } from "../types";
import { useAuth } from "../hooks/useAuth";
import { profileService } from "../services/profile";
import { familyService } from "../services/family";

// ============================================================
// アプリ全体の状態（プロフィール・家族・表示モード）
// 既存の認証処理（AuthContext / useAuth）はそのまま利用する
// ============================================================

interface AppContextValue {
  profile: Profile | null;
  family: Family | null;
  members: FamilyMember[];
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  loading: boolean;
  setProfile: (profile: Profile) => void;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextValue>({
  profile: null,
  family: null,
  members: [],
  mode: "parent",
  setMode: () => {},
  loading: true,
  setProfile: () => {},
  refresh: async () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [mode, setMode] = useState<AppMode>("parent");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setProfileState(null);
      setFamily(null);
      setMembers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const myProfile = await profileService.getMyProfile(user.id);
      setProfileState(myProfile);
      if (myProfile) {
        setMode(myProfile.role === "grandparent" ? "grandparent" : "parent");
        const myFamily = await familyService.getMyFamily(user.id);
        setFamily(myFamily);
        if (myFamily) {
          const familyMembers = await familyService.getMembers(myFamily.id);
          setMembers(familyMembers);
        } else {
          setMembers([]);
        }
      } else {
        setFamily(null);
        setMembers([]);
      }
    } catch (error) {
      // プロフィール / 家族が未作成の場合は null のまま扱う
      console.warn("アプリ状態の取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setProfile = useCallback((next: Profile) => {
    setProfileState(next);
    setMode(next.role === "grandparent" ? "grandparent" : "parent");
  }, []);

  const value = useMemo(
    () => ({ profile, family, members, mode, setMode, loading, setProfile, refresh }),
    [profile, family, members, mode, loading, setProfile, refresh],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  return useContext(AppContext);
}
