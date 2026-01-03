import { motion } from 'framer-motion';

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center space-y-6">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1, repeat: Infinity }
          }}
          className="text-6xl text-indigo-500"
        >
          ◆
        </motion.div>
        <p className="text-neutral-400">{message}</p>
      </div>
    </div>
  );
}