"use client"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

export default function Pagination({ paginationData }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Extract pagination data or use defaults
    const {
        page = 1,
        limit = 10,
        total = 0,
        totalPages = 0,
        hasNextPage = false,
        hasPrevPage = false,
        nextPage = null,
        prevPage = null
    } = paginationData || {}

    // Function to update URL with new page
    const updatePage = (newPage) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', newPage.toString())
        router.push(`${pathname}?${params.toString()}`)
    }

    // Function to update limit
    const updateLimit = (newLimit) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('limit', newLimit.toString())
        params.set('page', '1') // Reset to first page when changing limit
        router.push(`${pathname}?${params.toString()}`)
    }

    // Calculate page numbers to show
    const getPageNumbers = () => {
        const pages = []
        const maxPagesToShow = 5

        if (totalPages <= maxPagesToShow) {
            // Show all pages if total pages is less than max
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Show pages around current page
            let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2))
            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

            // Adjust start if we're near the end
            if (endPage - startPage < maxPagesToShow - 1) {
                startPage = Math.max(1, endPage - maxPagesToShow + 1)
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i)
            }
        }

        return pages
    }

    const pageNumbers = getPageNumbers()
    const startRecord = total === 0 ? 0 : (page - 1) * limit + 1
    const endRecord = Math.min(page * limit, total)

    if (totalPages === 0) {
        return null // Don't show pagination if no data
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-base-200 rounded-lg shadow-sm">
            {/* Records Info */}
            <div className="flex items-center gap-2">

                <div className="text-sm text-base-content/70">
                    Showing <span className="font-semibold text-base-content">{startRecord}</span> to{' '}
                    <span className="font-semibold text-base-content">{endRecord}</span> of{' '}
                    <span className="font-semibold text-base-content">{total}</span> entries
                </div>

                <div className="h-4 w-px bg-base-content/20"></div>

                {/* Page Info */}
                <div className="text-sm text-base-content/70 hidden md:block">
                    Page <span className="font-semibold text-base-content">{page}</span> of{' '}
                    <span className="font-semibold text-base-content">{totalPages}</span>
                </div>

            </div>




            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
                {/* Limit Selector */}
                <div className="flex items-center gap-2">
                    <label className="text-sm text-base-content/70">Show:</label>
                    <select
                        value={limit}
                        onChange={(e) => updateLimit(Number(e.target.value))}
                        className="select select-bordered select-sm w-20 focus:outline-0"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>

                {/* Page Navigation */}
                <div className="join">
                    {/* Previous Button */}
                    <button
                        onClick={() => updatePage(prevPage)}
                        disabled={!hasPrevPage}
                        className={`join-item btn btn-sm ${hasPrevPage ? 'btn-primary' : 'btn-disabled'}`}
                    >
                        <i className="fa-solid fa-chevron-left"></i>
                        <span className="hidden sm:inline ml-1">Previous</span>
                    </button>

                    {/* First Page */}
                    {pageNumbers[0] > 1 && (
                        <>
                            <button
                                onClick={() => updatePage(1)}
                                className="join-item btn btn-sm btn-ghost"
                            >
                                1
                            </button>
                            {pageNumbers[0] > 2 && (
                                <span className="join-item btn btn-sm btn-disabled">...</span>
                            )}
                        </>
                    )}


                    {/* Page Numbers */}
                    {pageNumbers.map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => updatePage(pageNum)}
                            className={`join-item btn btn-sm ${pageNum === page
                                ? 'btn-primary btn-active'
                                : 'btn-ghost'
                                }`}
                        >
                            {pageNum}
                        </button>
                    ))}

                    {/* Last Page */}
                    {pageNumbers[pageNumbers.length - 1] < totalPages && (
                        <>
                            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                                <span className="join-item btn btn-sm btn-disabled">...</span>
                            )}
                            <button
                                onClick={() => updatePage(totalPages)}
                                className="join-item btn btn-sm btn-ghost"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}

                    {/* Next Button */}
                    <button
                        onClick={() => updatePage(nextPage)}
                        disabled={!hasNextPage}
                        className={`join-item btn btn-sm ${hasNextPage ? 'btn-primary' : 'btn-disabled'}`}
                    >
                        <span className="hidden sm:inline mr-1">Next</span>
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>

            </div>
        </div>
    )
}
