import Header from '../widgets/Header';
import style from './styles/LandingPage.module.scss';

function LandingPage() {
    return (
        <div className={style.pageWrapper}>
            <Header />
        </div>
    );
}

export default LandingPage;
