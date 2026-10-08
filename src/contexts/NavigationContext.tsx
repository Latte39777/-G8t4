import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { Category } from "../types";

// ============================================================
// 画面遷移（軽量スタックナビゲーション）
// 既存のプロジェクト構成に合わせ、追加ライブラリは使わない
// ============================================================

export type ScreenName =
  | "home"
  | "itemList"
  | "createItem"
  | "itemDetail"
  | "support"
  | "family"
  | "history";

export interface ScreenParamsMap {
  home: undefined;
  itemList: { category: Category };
  createItem: undefined;
  itemDetail: { itemId: string };
  support: { itemId: string };
  family: undefined;
  history: undefined;
}

export type Route = {
  [K in ScreenName]: { name: K; params?: ScreenParamsMap[K] };
}[ScreenName];

interface NavigationValue {
  route: Route;
  stack: Route[];
  navigate: <K extends ScreenName>(name: K, params?: ScreenParamsMap[K]) => void;
  replace: <K extends ScreenName>(name: K, params?: ScreenParamsMap[K]) => void;
  goBack: () => void;
  canGoBack: boolean;
}

const NavigationContext = createContext<NavigationValue>({
  route: { name: "home" },
  stack: [{ name: "home" }],
  navigate: () => {},
  replace: () => {},
  goBack: () => {},
  canGoBack: false,
});

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Route[]>([{ name: "home" }]);

  const navigate = useCallback(
    <K extends ScreenName>(name: K, params?: ScreenParamsMap[K]) => {
      setStack((prev) => [...prev, { name, params } as Route]);
    },
    [],
  );

  const replace = useCallback(
    <K extends ScreenName>(name: K, params?: ScreenParamsMap[K]) => {
      setStack((prev) => [...prev.slice(0, -1), { name, params } as Route]);
    },
    [],
  );

  const goBack = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const value = useMemo(() => {
    const route = stack[stack.length - 1] ?? { name: "home" as ScreenName };
    return {
      route,
      stack,
      navigate,
      replace,
      goBack,
      canGoBack: stack.length > 1,
    };
  }, [stack, navigate, replace, goBack]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationValue {
  return useContext(NavigationContext);
}
