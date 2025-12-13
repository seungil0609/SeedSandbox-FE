import "./App.css";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  Outlet,
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
import { useAtomValue } from "jotai";
import { isAuthenticatedAtom } from "../store/auth/atoms";
import { useFirebaseAuth } from "../store/auth/firebase";

// 🌀 로딩 컴포넌트 (간단하게 구현)
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
      }}
    >
      Loading SeedUp...
    </div>
  );
}

// 🛡️ [게스트 가드] 로그인한 사람은 로그인/회원가입 페이지 접근 금지 -> 대시보드로 보냄
function GuestOnlyRoute() {
  const isAuth = useAtomValue(isAuthenticatedAtom);
  if (isAuth === undefined) return <GlobalLoader />; // 로딩 중
  return isAuth ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

// 🛡️ [유저 가드] 로그인 안 한 사람은 내부 페이지 접근 금지 -> 로그인으로 보냄
function ProtectedRoute() {
  const isAuth = useAtomValue(isAuthenticatedAtom);
  if (isAuth === undefined) return <GlobalLoader />; // 로딩 중
  return isAuth ? <Outlet /> : <Navigate to="/signin" replace />;
}

// 🔀 [루트 리다이렉터] / 접속 시 상태에 따라 분기
function RootRedirector() {
  const isAuth = useAtomValue(isAuthenticatedAtom);
  if (isAuth === undefined) return <GlobalLoader />;
  return isAuth ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/signin" replace />
  );
}

function App() {
  // Firebase Auth 리스너 실행
  useFirebaseAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. 기본 경로 처리 */}
        <Route path="/" element={<RootRedirector />} />

        {/* 2. 게스트 전용 (로그인/회원가입) - 로그인 상태면 접근 불가 */}
        <Route element={<GuestOnlyRoute />}>
          {/* LandingPage는 현재 불필요해 보이므로 제거하거나 signin으로 대체 */}
          <Route path="/landing" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>

        {/* 3. 회원 전용 (대시보드 등) - 비로그인 상태면 접근 불가 */}
        <Route element={<ProtectedRoute />}>
          {/* MainPage 레이아웃(Header 포함) 적용 */}
          <Route element={<MainPage />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/transactions" element={<TransactionPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/search/:query" element={<SearchResultPage />} />
            <Route path="/my" element={<MyPage />} />
          </Route>
        </Route>

        {/* 4. 없는 페이지 처리 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
