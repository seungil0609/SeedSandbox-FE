import { Outlet } from 'react-router-dom';
import style from './styles/MainPage.module.scss';
import Header from '../widgets/Header';

function MainPage() {
    return (
        <div className={style.siteContainer}>
            <Header />
            <div className="body">
                <Outlet />
            </div>
        </div>
    );
}

export default MainPage;
