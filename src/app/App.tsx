import "./App.css";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import MainPage from "../pages/MainPage";
import DashboardPage from "../pages/DashboardPage";
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";
import PortfolioPage from "../pages/PortfolioPage";
import CommunityPage from "../pages/CommunityPage";
import MyPage from "../pages/MyPage";
import TransactionPage from "../pages/TransactionPage";
import SearchResultPage from "../pages/SearchResultPage";
import { useAtomValue, useSetAtom } from "jotai";
import { isAuthenticatedAtom, idTokenAtom } from "../store/auth/atoms";
import { useFirebaseAuth } from "../store/auth/firebase";
import { useEffect, useState } from "react";
import axios from "axios";

// 🌀 로딩 컴포넌트
function GlobalLoader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#111",
        color: "#fff",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <div className="loader"></div>
      <h2>SeedUp 로딩 중...</h2>
    </div>
  );
}

// 🛡️ [게스트 가드] 로그인한 유저는 접근 불가 -> 대시보드로
function GuestOnlyRoute() {
  const isAuth = useAtomValue(isAuthenticatedAtom);
  if (isAuth === undefined) return <GlobalLoader />;
  return isAuth ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

// 🛡️ [유저 가드] 비로그인 유저는 접근 불가 -> 로그인으로
function ProtectedRoute() {
  const isAuth = useAtomValue(isAuthenticatedAtom);
  if (isAuth === undefined) return <GlobalLoader />;
  return isAuth ? <Outlet /> : <Navigate to="/signin" replace />;
}

// 🔀 [루트 리다이렉터]
function RootRedirector() {
  const isAuth = useAtomValue(isAuthenticatedAtom);
  if (isAuth === undefined) return <GlobalLoader />;
  return isAuth ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/signin" replace />
  );
}

// 🚨 [핵심] Axios Interceptor 설정 컴포넌트
// 백엔드에서 401 에러가 오면 즉시 로그아웃 처리하고 로그인 페이지로 보냄
function AxiosInterceptor() {
  const setAuth = useSetAtom(isAuthenticatedAtom);
  const setToken = useSetAtom(idTokenAtom);
  const navigate = useNavigate();
  const [isSet, setIsSet] = useState(false);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        // 401 Unauthorized 에러 발생 시 (토큰 만료 or 위조)
        if (error.response && error.response.status === 401) {
          console.warn("세션이 만료되었습니다. 로그아웃 처리합니다.");

          // 1. 상태 초기화
          setAuth(false);
          setToken(null);

          // 2. 로컬 스토리지 클린업 (선택된 포트폴리오 등)
          localStorage.removeItem("selectedPortfolio");

          // 3. 로그인 페이지로 강제 이동
          navigate("/signin", { replace: true });
        }
        return Promise.reject(error);
      }
    );

    setIsSet(true);

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [setAuth, setToken, navigate]);

  return null;
}

function App() {
  useFirebaseAuth(); // Firebase Listener

  return (
    <BrowserRouter>
      {/* Axios Interceptor는 Router 내부에서 동작해야 navigate 사용 가능 */}
      <AxiosInterceptor />

      <Routes>
        {/* 1. 루트 접속 시 자동 분기 */}
        <Route path="/" element={<RootRedirector />} />

        {/* 2. 게스트 전용 */}
        <Route element={<GuestOnlyRoute />}>
          <Route path="/landing" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>

        {/* 3. 회원 전용 */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainPage />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/transactions" element={<TransactionPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/search/:query" element={<SearchResultPage />} />
            <Route path="/my" element={<MyPage />} />
          </Route>
        </Route>

        {/* 4. 404 처리 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
