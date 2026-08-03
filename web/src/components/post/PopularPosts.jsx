import { useEffect, useState } from "react";
import { request } from "../../api/client";

export default function PopularPosts() {
    const [popularPosts, setPopularPosts] = useState([]);

    useEffect(() => {
        async function fetchPopularPosts() {
            try {
                const data = await request('/posts/popular?limit=5', {
                    method: "GET"
                })

                setPopularPosts(data)

            } catch(error) {
                console.error(error);
            }
        }

        fetchPopularPosts();

    }, []);

    return (
        <>
        </>

    );
}