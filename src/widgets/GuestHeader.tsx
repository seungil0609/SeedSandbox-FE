import { Menu } from 'lucide-react';
import style from './styles/Header.module.scss';
function GuestHeader() {
    return (
        <div className={style.header}>
            <a className={style.logo} href="/">
                SeedUp
            </a>
            <button className={style.mobileMenuButton}>
                <Menu className={style.mobileMenuButton__icon} />
            </button>
        </div>
    );
}

export default GuestHeader;
