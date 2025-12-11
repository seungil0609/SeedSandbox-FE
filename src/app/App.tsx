import './App.css';
import { BrowserRouter, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import MainPage from '../pages/MainPage';
import DashboardPage from '../pages/DashboardPage';
import LandingPage from '../pages/LandingPage';
import SignInPage from '../pages/SignInPage';
import SignUpPage from '../pages/SignUpPage';
import PortfolioPage from '../pages/PortfolioPage';
import CommunityPage from '../pages/CommunityPage';
import MyPage from '../pages/MyPage';
import { useAtomValue } from 'jotai';
import { isAuthenticatedAtom } from '../store/auth/atoms';
import { useFirebaseAuth } from '../store/auth/firebase';
import TransactionPage from '../pages/TransactionPage';
import SearchResultPage from '../pages/SearchResultPage';

export function RequireAuth() {
    const isAuth = useAtomValue(isAuthenticatedAtom);
    if (isAuth === undefined) {
        return null;
    }
    if (isAuth === false) {
        return <Navigate to="/signin" replace />;
    }

    return <Outlet />;
}

function App() {
    useFirebaseAuth();
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />}>
                    <Route element={<RequireAuth />}>
                        <Route index element={<DashboardPage />} />
                        <Route path="portfolio" element={<PortfolioPage />} />
                        <Route path="transactions" element={<TransactionPage />} />
                        <Route path="community" element={<CommunityPage />} />
                        <Route path="search/:query" element={<SearchResultPage />}></Route>
                        <Route path="my" element={<MyPage />} />
                    </Route>
                </Route>
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
