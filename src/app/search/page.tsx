"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface SearchResult {
    _id: string;
    title: string;
    slug: string;
    category: string;
    subType?: string;
    thumbnail?: string;
}

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");

    const [results, setResults] = useState<SearchResult[]>([]);
    const [totalResults, setTotalResults] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(page);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) {
            setLoading(false);
            return;
        }

        setLoading(true);
        fetch(`/api/search?q=${encodeURIComponent(query)}&page=${page}`)
            .then((res) => res.json())
            .then((data) => {
                setResults(data.results || []);
                setTotalResults(data.totalResults || 0);
                setTotalPages(data.totalPages || 0);
                setCurrentPage(data.currentPage || page);
            })
            .catch(() => setResults([]))
            .finally(() => setLoading(false));
    }, [query, page]);

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    return (
        <>
            <header className="search-header">
                <h1><i className="fas fa-search"></i> Search Results</h1>
                <p>Showing results for: &ldquo;<strong>{query}</strong>&rdquo;</p>
                <div className="search-stats">
                    Found {totalResults} matches &bull; Page {currentPage} of {totalPages || 1}
                </div>
            </header>

            <div className="archive-container">
                {loading ? (
                    <div style={{ textAlign: "center", padding: "50px" }}>
                        <i className="fas fa-spinner fa-spin" style={{ fontSize: "3rem", color: "#ccc" }}></i>
                        <p style={{ marginTop: "1rem", color: "#666" }}>Searching...</p>
                    </div>
                ) : results.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "50px" }}>
                        <i className="fas fa-search-minus" style={{ fontSize: "4rem", color: "#ccc" }}></i>
                        <h2 style={{ color: "#666", marginTop: "20px" }}>No matches found for &ldquo;{query}&rdquo;</h2>
                        <p>Try searching for a different keyword or check the spelling.</p>
                        <div style={{ marginTop: "20px" }}>
                            <Link href="/" className="btn-primary">Return Home</Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="archive-grid">
                            {results.map((item) => (
                                <Link key={item._id} href={`/entry/${item.slug}`} className="archive-card">
                                    <div
                                        className="card-image"
                                        style={{ backgroundImage: `url('${item.thumbnail || "/images/default-card.jpg"}')` }}
                                    >
                                        <span className="category-badge">{item.category}</span>
                                    </div>
                                    <div className="card-content">
                                        <h3>{item.title}</h3>
                                        <div className="card-meta">
                                            {item.subType && (
                                                <span><i className="fas fa-tag"></i> {item.subType}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                {currentPage > 1 && (
                                    <Link href={`/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}`} className="page-link">
                                        &laquo; Prev
                                    </Link>
                                )}
                                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((i) => (
                                    <Link
                                        key={i}
                                        href={`/search?q=${encodeURIComponent(query)}&page=${i}`}
                                        className={`page-link ${i === currentPage ? "active" : ""}`}
                                    >
                                        {i}
                                    </Link>
                                ))}
                                {currentPage < totalPages && (
                                    <Link href={`/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}`} className="page-link">
                                        Next &raquo;
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: "center", padding: "50px" }}><i className="fas fa-spinner fa-spin" style={{ fontSize: "3rem" }}></i></div>}>
            <SearchContent />
        </Suspense>
    );
}
