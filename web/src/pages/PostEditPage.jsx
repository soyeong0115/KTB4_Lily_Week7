import { useParams } from 'react-router-dom';

import Header from '../components/layout/Header.jsx';
import PostForm from '../components/post/PostForm.jsx';

export default function PostEditPage() {
    const { postId } = useParams();

    return (
        <>
            <Header />
            <PostForm mode="edit" postId={postId} />
        </>
    );
}
