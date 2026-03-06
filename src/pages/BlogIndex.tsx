import {Link} from "react-router-dom"
import {getAllPostMeta} from "../blog/mdPosts"
import "./BlogPost.css"

export function BlogIndex() {
    const posts = getAllPostMeta()

    return (
        <main className="blog-index-main">
            <div className="blog-post-wrapper">
                <div className="blog-card">
                    <div className="blog-post-meta">
                        <h1>Blog</h1>
                    </div>

                    {posts.length === 0 ? (
                        <p>No posts found.</p>
                    ) : (
                        <ul className="blog-index-list">
                            {posts.map((p) => (
                                <li key={p.slug} className="blog-index-item">
                                    <h2 className="blog-index-title">
                                        <Link to={`/blog/${p.slug}`}>{p.meta.title}</Link>
                                    </h2>
                                    {p.meta.date && <small>{p.meta.date}</small>}
                                    {p.meta.summary && <p className="blog-index-summary">{p.meta.summary}</p>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </main>
    )
}