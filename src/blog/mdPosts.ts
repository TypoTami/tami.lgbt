export type PostMeta = {
    title: string;
    date?: string;
    summary?: string;
    tags?: string[];
};

export type PostImage = {
    originalSrc: string;
    url: string;
    alt?: string;
};

export type PostSummary = {
    slug: string;
    meta: PostMeta;
};

export type Post = {
    slug: string;
    meta: PostMeta;
    content: string;
    images: PostImage[];
};

/**
 * Eager metadata source for blog index rendering.
 * This still reads markdown at build time, but only the index uses it.
 */
const metadataModules = import.meta.glob("../posts/*.md", {
    eager: true,
    query: "?raw",
    import: "default",
}) as Record<string, string>;

/**
 * Lazy content source for individual blog posts.
 * Each post is loaded on demand.
 */
const postLoaders = import.meta.glob("../posts/*.md", {
    query: "?raw",
    import: "default",
}) as Record<string, () => Promise<string>>;

const imageModules = import.meta.glob("../posts/*.{png,jpg,jpeg,gif,webp,svg,avif}", {
    eager: true,
    import: "default",
}) as Record<string, string>;

let cachedPostSummaries: PostSummary[] | null = null;
const postCache = new Map<string, Post>();

function pathToSlug(path: string) {
    // "../posts/hello-blog.md" -> "hello-blog"
    const file = path.split("/").pop() ?? "";
    return file.replace(/\.md$/, "");
}

function slugToPath(slug: string) {
    return `../posts/${slug}.md`;
}

function isLocalImagePath(src: string) {
    return !src.startsWith("http://")
        && !src.startsWith("https://")
        && !src.startsWith("/")
        && !src.startsWith("data:");
}

function resolveImageUrl(src: string) {
    const normalizedPath = `../posts/${src}`;
    return imageModules[normalizedPath] ?? src;
}

function extractMarkdownImages(content: string): PostImage[] {
    const imageRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
    const images = new Map<string, PostImage>();

    for (const match of content.matchAll(imageRegex)) {
        const alt = match[1]?.trim() || undefined;
        const originalSrc = match[2]?.trim();

        if (!originalSrc || !isLocalImagePath(originalSrc)) {
            continue;
        }

        if (!images.has(originalSrc)) {
            images.set(originalSrc, {
                originalSrc,
                url: resolveImageUrl(originalSrc),
                alt,
            });
        }
    }

    return [...images.values()];
}

function rewriteMarkdownImageUrls(content: string) {
    const imageRegex = /(!\[[^\]]*\]\()([^)]+)(\))/g;

    return content.replace(imageRegex, (fullMatch, prefix, rawSrc, suffix) => {
        const src = String(rawSrc).trim();

        if (!isLocalImagePath(src)) {
            return fullMatch;
        }

        return `${prefix}${resolveImageUrl(src)}${suffix}`;
    });
}

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
    // Supports:
    // ---
    // key: value
    // tags: [a, b]
    // ---
    // markdown...
    if (!raw.startsWith("---")) {
        return {data: {}, content: raw};
    }

    const end = raw.indexOf("\n---", 3);
    if (end === -1) {
        return {data: {}, content: raw};
    }

    const fmBlock = raw.slice(3, end).trim();
    const content = raw.slice(end + "\n---".length).replace(/^\s*\n/, "");

    const data: Record<string, unknown> = {};

    for (const line of fmBlock.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;

        const colon = trimmed.indexOf(":");
        if (colon === -1) continue;

        const key = trimmed.slice(0, colon).trim();
        let value = trimmed.slice(colon + 1).trim();

        if (value.startsWith("[") && value.endsWith("]")) {
            const inner = value.slice(1, -1).trim();
            data[key] = inner
                ? inner.split(",").map((s) => s.trim()).filter(Boolean)
                : [];
            continue;
        }

        value = value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
        data[key] = value;
    }

    return {data, content};
}

function toPostMeta(data: Record<string, unknown>, fallbackTitle: string): PostMeta {
    return {
        title: (data.title as string) ?? fallbackTitle,
        date: data.date as string | undefined,
        summary: data.summary as string | undefined,
        tags: data.tags as string[] | undefined,
    };
}

export function getAllPostMeta(): PostSummary[] {
    if (cachedPostSummaries) {
        return cachedPostSummaries;
    }

    const posts: PostSummary[] = Object.entries(metadataModules).map(([path, raw]) => {
        const slug = pathToSlug(path);
        const {data} = parseFrontmatter(raw);

        return {
            slug,
            meta: toPostMeta(data, slug),
        };
    });

    posts.sort((a, b) => (b.meta.date ?? "").localeCompare(a.meta.date ?? ""));
    cachedPostSummaries = posts;

    return posts;
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
    const cachedPost = postCache.get(slug);
    if (cachedPost) {
        return cachedPost;
    }

    const path = slugToPath(slug);
    const loadPost = postLoaders[path];

    if (!loadPost) {
        return undefined;
    }

    const raw = await loadPost();
    const {data, content: rawContent} = parseFrontmatter(raw);
    const images = extractMarkdownImages(rawContent);
    const content = rewriteMarkdownImageUrls(rawContent);

    const post: Post = {
        slug,
        meta: toPostMeta(data, slug),
        content,
        images,
    };

    postCache.set(slug, post);
    return post;
}