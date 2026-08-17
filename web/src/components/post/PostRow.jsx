import PostCard from "./PostCard.jsx";

export default function PostRow({ index, style, posts }) {
    return (
        <div style={style}>
            <PostCard post={posts[index]} />
        </div>
    );
}
