import {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex-swap.min.css";
import "highlight.js/styles/github.css";
import {getPostBySlug, type Post} from "../blog/mdPosts";
import "./BlogPost.css"
import remarkGfm from "remark-gfm";

export function BlogPost() {
    const {slug} = useParams<{ slug: string }>();
    const [post, setPost] = useState<Post | null | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;

        async function loadPost() {
            if (!slug) {
                setPost(null);
                return;
            }

            setPost(undefined);

            const loadedPost = await getPostBySlug(slug);

            if (!cancelled) {
                setPost(loadedPost ?? null);
            }
        }

        void loadPost();

        return () => {
            cancelled = true;
        };
    }, [slug]);

    if (post === undefined) {
        return (
            <main>
                <h1>Loading post...</h1>
                <p>
                    <Link to="/blog">Back to blog</Link>
                </p>
            </main>
        );
    }

    if (post === null) {
        return (
            <main>
                <h1>Post not found</h1>
                <p>
                    <Link to="/blog">Back to blog</Link>
                </p>
            </main>
        );
    }

    return (
        <main>
            <div className="blog-post-wrapper">
                <div className="back-link-wrapper">
                    <Link className="back-link" to="/blog">Go back</Link>
                </div>

                <div className="blog-card">
                    <div className="blog-post-meta">
                        <h1>{post.meta.title}</h1>
                        {post.meta.date && <small>{post.meta.date}</small>}
                    </div>

                    <article className="blog-post-content">
                        <ReactMarkdown
                            remarkPlugins={[remarkMath, remarkGfm]}
                            rehypePlugins={[rehypeKatex, rehypeHighlight]}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </article>
                </div>
            </div>
        </main>
    );
}