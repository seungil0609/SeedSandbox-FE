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

export function RequireAuth() {
  const isAuth = useAtomValue(isAuthenticatedAtom);
  if (isAuth === undefined) {
    return null; // 로딩 중
  }
  if (isAuth === false) {
    // 로그인이 안 되어 있으면 로그인 페이지로 튕겨냄
    return <Navigate to="/signin" replace />;
  }
  return <Outlet />;
}

function App() {
  useFirebaseAuth();
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. 메인('/') 접속 시 무조건 랜딩 페이지(로그인 유도) 보여주기 */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. 로그인/회원가입 페이지 */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* 3. 로그인 해야만 접근 가능한 페이지들 */}
        <Route element={<MainPage />}>
          <Route element={<RequireAuth />}>
            {/* 대시보드는 이제 /dashboard 주소로 이동 */}
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
