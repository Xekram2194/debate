import { AnimatePresence, motion } from 'framer-motion';

/** Dígito que "rueda" verticalmente al cambiar, como un marcador de estudio. */
export default function RollingDigit({ value }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden text-center leading-none">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: '-55%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '55%', opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute inset-0 block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
