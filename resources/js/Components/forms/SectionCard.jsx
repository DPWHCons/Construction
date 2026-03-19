export default function SectionCard({ title, children, className = "" }) {
    return (
        <div className={`bg-slate-50 rounded-xl p-4 border border-slate-200 ${className}`}>
            <h4 className="text-base font-semibold text-slate-800 font-montserrat mb-3">
                {title}
            </h4>

            {children}
        </div>
    );
}
