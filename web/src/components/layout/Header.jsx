import AuthMenu from './AuthMenu.jsx';

export default function Header() {
    return (
        <header className="header">
            <h1 className="header-title">BABBLE.</h1>
            <p className="header-tagline">Talk & Chatter Zine</p>
            <AuthMenu />
        </header>
    );
}
