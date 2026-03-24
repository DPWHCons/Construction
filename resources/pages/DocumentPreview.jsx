import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';

export default function DocumentPreview({ url, filename }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [useIframeFallback, setUseIframeFallback] = useState(false);
    const [zoom, setZoom] = useState(1.1);
    const containerRef = useRef(null);

    const safeUrl = useMemo(() => url || '', [url]);
    const safeFilename = useMemo(() => filename || 'Document', [filename]);
    const isDocx = useMemo(() => /\.docx($|\?)/i.test(safeFilename) || /\.docx($|\?)/i.test(safeUrl), [safeFilename, safeUrl]);

    useEffect(() => {
        const renderDocx = async () => {
            if (!isDocx || !safeUrl) {
                setUseIframeFallback(true);
                return;
            }

            setLoading(true);
            setError('');
            setUseIframeFallback(false);
            if (containerRef.current) containerRef.current.innerHTML = '';

            try {
                const response = await fetch(safeUrl, { credentials: 'include' });
                if (!response.ok) {
                    throw new Error(`Preview fetch failed (${response.status}).`);
                }

                const arrayBuffer = await response.arrayBuffer();
                const blob = new Blob([arrayBuffer], {
                    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                });

                if (!containerRef.current) return;
                await renderAsync(blob, containerRef.current, null, {
                    inWrapper: true,
                    breakPages: true,
                    renderHeaders: true,
                    renderFooters: true,
                    renderFootnotes: true,
                    // Some project docs place text close to page edge; ignore fixed width to prevent clipping.
                    ignoreWidth: true,
                    useBase64URL: true,
                });

                if (!containerRef.current.querySelector('.docx')) {
                    setUseIframeFallback(true);
                }
            } catch (e) {
                setError(e?.message || 'Unable to render DOCX preview.');
                setUseIframeFallback(true);
            } finally {
                setLoading(false);
            }
        };

        renderDocx();
    }, [isDocx, safeUrl]);

    return (
        <>
            <Head title={`Preview - ${safeFilename}`} />
            <div className="min-h-screen bg-blue-900 text-white">
                <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
                    <div className="px-4 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold">
                                DOC
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] uppercase tracking-wide text-slate-500">Document Preview</p>
                                <h1 className="text-sm font-semibold truncate text-slate-900">{safeFilename}</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex items-center text-[11px] text-slate-600 bg-slate-100 border border-slate-200 rounded-md px-2 py-1">
                                Zoom
                            </div>
                            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-slate-800">
                            <button
                                type="button"
                                onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.1).toFixed(1))))}
                                className="px-2 py-1 text-sm hover:bg-white rounded transition-colors"
                                title="Zoom out"
                            >
                                -
                            </button>
                            <span className="px-2 text-xs min-w-[56px] text-center font-medium text-slate-700">{Math.round(zoom * 100)}%</span>
                            <button
                                type="button"
                                onClick={() => setZoom((z) => Math.min(2.4, Number((z + 0.1).toFixed(1))))}
                                className="px-2 py-1 text-sm hover:bg-white rounded transition-colors"
                                title="Zoom in"
                            >
                                +
                            </button>
                            <button
                                type="button"
                                onClick={() => setZoom(1)}
                                className="ml-1 px-2 py-1 text-xs hover:bg-white rounded transition-colors text-slate-700"
                                title="Reset zoom"
                            >
                                Reset
                            </button>
                        </div>
                        <a
                            href={safeUrl || '#'}
                            download={safeFilename}
                            className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Download
                        </a>
                    </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-200 min-h-[calc(100vh-68px)] overflow-auto">
                    {loading ? (
                        <div className="text-slate-600 text-center py-16">Loading preview...</div>
                    ) : error ? (
                        <div className="text-center py-10 text-red-600">{error}</div>
                    ) : null}

                    {!useIframeFallback ? (
                        <div className="mx-auto w-fit min-w-full" style={{ zoom }}>
                            <div ref={containerRef} />
                        </div>
                    ) : (
                        <div
                            className="mx-auto bg-white shadow-xl border border-slate-300"
                            style={{
                                width: `${Math.round(980 * zoom)}px`,
                                minHeight: `${Math.round(1123 * zoom)}px`,
                            }}
                        >
                            <iframe
                                src={safeUrl}
                                className="w-full"
                                style={{ height: `${Math.round(1123 * zoom)}px` }}
                                title={`Preview of ${safeFilename}`}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
