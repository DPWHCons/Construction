import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            style={{
                ...props.style,
                paddingRight: props.style?.paddingRight || '12px',
                paddingLeft: props.style?.paddingLeft || '12px'
            }}
            className={
                'block w-full rounded-xl border-2 border-neutral-200 bg-white py-3 text-neutral-900 placeholder-neutral-400 shadow-sm transition-all duration-200 focus:border-primary-500 focus:ring-primary-500 focus:ring-2 focus:ring-offset-0 hover:border-neutral-300 disabled:bg-neutral-50 disabled:text-neutral-500 disabled:border-neutral-200 ' +
                className
            }
            ref={localRef}
        />
    );
});
