import { useCallback, useEffect, useRef } from "react";

export function useInfiniteScroll({ onIntersect, isLoadingRef, hasNextPageRef, root = null, threshold = 0.1 }) {
    const targetRef = useRef(null);

    const handleObserver = useCallback((entries) => {
        const target = entries[0];

        if (target.isIntersecting && !isLoadingRef.current && hasNextPageRef.current) {
            onIntersect();
        }
    }, [onIntersect, isLoadingRef, hasNextPageRef]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            handleObserver,
            {
                root,
                rootMargin: '0px',
                threshold
            }
        );

        const target = targetRef.current;

        if (target) {
            observer.observe(target);
        }

        return () => {
            observer.disconnect();
        };
    }, [handleObserver, root, threshold]);

    return targetRef;
}
