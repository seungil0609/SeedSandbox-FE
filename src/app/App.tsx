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
import LandingPage from "../pages/LandingPage";
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";
import PortfolioPage from "../pages/PortfolioPage";
import CommunityPage from "../pages/CommunityPage";
import MyPage from "../pages/MyPage";
import { useAtomValue } from "jotai";
import { isAuthenticatedAtom } from "../store/auth/atoms";
import { useFirebaseAuth } from "../store/auth/firebase";
import TransactionPage from "../pages/TransactionPage";
import SearchResultPage from "../pages/SearchResultPage";

// 1. [로그인 필수] 로그인이 안 되어 있으면 로그인 페이지로 튕겨냄
export function RequireAuth() {
  const isAuth = useAtomValue(isAuthenticatedAtom);
  if (isAuth === undefined) {
    return null; // 로딩 중 (스피너 등을 넣어도 좋음)
  }
  if (isAuth === false) {
    return <Navigate to="/signin" replace />;
  }
  return <Outlet />;
}

// 2. [추가됨] 루트('/') 접속 시 분기 처리 컴포넌트
function RootRedirector() {
  const isAuth = useAtomValue(isAuthenticatedAtom);

  if (isAuth === undefined) {
    return null; // 로딩 중
  }
  // 로그인 상태면 대시보드로, 아니면 로그인 페이지로
  return isAuth ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/signin" replace />
  );
}

function App() {
  useFirebaseAuth();
  return (
    <BrowserRouter>
      <Routes>
        {/* 3. 메인('/') 접속 시 로그인 여부에 따라 자동 이동 */}
        <Route path="/" element={<RootRedirector />} />

        {/* 로그인/회원가입 페이지 */}
        {/* LandingPage는 현재 로그인된 헤더를 보여주는 문제가 있으므로 사용하지 않거나 수정 필요 */}
        {/* <Route path="/landing" element={<LandingPage />} /> */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* 로그인 해야만 접근 가능한 페이지들 */}
        <Route element={<MainPage />}>
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/transactions" element={<TransactionPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/search/:query" element={<SearchResultPage />} />
            <Route path="/my" element={<MyPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
