import Header from '../components/layout/Header.jsx';
import PostForm from '../components/post/PostForm.jsx';

export default function PostCreatePage() {
    return (
        <>
            <Header backTo="/" />
            <PostForm mode="create" />
        </>
    );
}
