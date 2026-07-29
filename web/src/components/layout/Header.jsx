import { Link } from 'react-router-dom';

import AuthMenu from './AuthMenu.jsx';

export default function Header({ backTo }) {
    return (
        <header className="header">
            {backTo && <Link className="back-button" to={backTo}>‹</Link>}
            <h1 className="header-title">BABBLE.</h1>
            <p className="header-tagline">Talk & Chatter Zine</p>
            <AuthMenu />
        </header>
    );
}
