import { use, useEffect, useRef } from "react";

// TODO: IntersectionObserver 래핑 (기존 js/posts.js의 postListObserver 로직 참고)
export function useInfiniteScroll(callback) {
    const targetRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                callback();
            }
        });

        const target = targetRef.current;

        if (target) {
            observer.observe(target);
        }

        return () => {
            observer.disconnect();
        };
    }, [callback]);

    

    return targetRef;
}
