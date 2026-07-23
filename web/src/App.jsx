import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import PostsPage from './pages/PostsPage.jsx';
import PostDetailPage from './pages/PostDetailPage.jsx';
import PostCreatePage from './pages/PostCreatePage.jsx';
import PostEditPage from './pages/PostEditPage.jsx';
import ProfileEditPage from './pages/ProfileEditPage.jsx';
import PasswordEditPage from './pages/PasswordEditPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// 라우팅 표 (docs/react-migration-design.md 2-3 참고)
export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<PostsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/posts/:postId" element={<PostDetailPage />} />
                <Route
                    path="/posts/new"
                    element={
                        <ProtectedRoute>
                            <PostCreatePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/posts/:postId/edit"
                    element={
                        <ProtectedRoute>
                            <PostEditPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile/edit"
                    element={
                        <ProtectedRoute>
                            <ProfileEditPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/password/edit"
                    element={
                        <ProtectedRoute>
                            <PasswordEditPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
