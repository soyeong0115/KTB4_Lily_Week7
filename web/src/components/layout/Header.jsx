import { Link, useNavigate } from 'react-router-dom';

import AuthMenu from './AuthMenu.jsx';

export default function Header({ backTo, backToPrevious }) {
    const navigate = useNavigate();

    return (
        <header className="header">
            {backToPrevious && (
                <button className="back-button" type="button" onClick={() => navigate(-1)}>‹</button>
            )}
            {!backToPrevious && backTo && <Link className="back-button" to={backTo}>‹</Link>}
            <h1 className="header-title">BABBLE.</h1>
            <p className="header-tagline">Talk & Chatter Zine</p>
            <AuthMenu />
        </header>
    );
}
