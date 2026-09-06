import Link from 'next/link'

export default function NotFound() {
    return (
        <main className="notFoundPage">
            <header className="notFoundHeader">
                <span>404</span>
                <Link href="/" aria-label="Go to home">
                    <img
                        className="notFoundLogo"
                        src="/minimal_logo.svg"
                        alt="Style Up Studio"
                    />
                </Link>
            </header>

            <div className="notFoundContent">
                <section
                    className="notFoundPanel"
                    aria-labelledby="not-found-title"
                >
                    <h1 id="not-found-title" className="notFoundTitle">
                        PAGE NOT FOUND
                    </h1>

                    <p className="notFoundCopy">
                        This page is not in the archive. It may have moved,
                        changed names, or never made it to the final edit.
                    </p>

                    <div className="notFoundActions">
                        <Link className="notFoundLink" href="/">
                            [BACK TO WORK]
                        </Link>

                        <Link className="notFoundLink" href="/style-ups">
                            [STYLE UPS]
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    )
}