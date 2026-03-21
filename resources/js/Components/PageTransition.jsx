import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const pageVariants = {
    initial: {
        opacity: 0,
        x: -20,
    },
    in: {
        opacity: 1,
        x: 0,
    },
    out: {
        opacity: 0,
        x: 20,
    },
};

const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.3,
};

export default function PageTransition({ children, keyProp }) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={keyProp}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                style={{ width: '100%' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
