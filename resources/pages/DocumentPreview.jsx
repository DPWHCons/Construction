import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';

export default function DocumentPreview({ url, filename }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [useIframeFallback, setUseIframeFallback] = useState(false);
    const [zoom, setZoom] = useState(1);
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
            <div className="min-h-screen bg-slate-900 text-white">
                <div className="sticky top-0 z-20 bg-slate-800/95 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
                    <div className="min-w-0">
                        <p className="text-sm text-slate-300">Document Preview</p>
                        <h1 className="text-sm font-semibold truncate">{safeFilename}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white/10 rounded-lg p-1">
                            <button
                                type="button"
                                onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
                                className="px-2 py-1 text-sm hover:bg-white/20 rounded"
                            >
                                -
                            </button>
                            <span className="px-2 text-xs min-w-[52px] text-center">{Math.round(zoom * 100)}%</span>
                            <button
                                type="button"
                                onClick={() => setZoom((z) => Math.min(2, Number((z + 0.1).toFixed(1))))}
                                className="px-2 py-1 text-sm hover:bg-white/20 rounded"
                            >
                                +
                            </button>
                            <button
                                type="button"
                                onClick={() => setZoom(1)}
                                className="ml-1 px-2 py-1 text-xs hover:bg-white/20 rounded"
                            >
                                Reset
                            </button>
                        </div>
                        <a
                            href={safeUrl || '#'}
                            download={safeFilename}
                            className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm font-medium"
                        >
                            Download
                        </a>
                    </div>
                </div>

                <div className="p-6 bg-slate-200 min-h-[calc(100vh-68px)] overflow-auto">
                    {loading ? (
                        <div className="text-slate-600 text-center py-16">Loading preview...</div>
                    ) : error ? (
                        <div className="text-center py-10 text-red-600">{error}</div>
                    ) : null}

                    {!useIframeFallback ? (
                        <div className="mx-auto" style={{ zoom }}>
                            <div ref={containerRef} />
                        </div>
                    ) : (
                        <div
                            className="mx-auto bg-white shadow-xl border border-slate-300"
                            style={{
                                width: `${Math.round(794 * zoom)}px`,
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
