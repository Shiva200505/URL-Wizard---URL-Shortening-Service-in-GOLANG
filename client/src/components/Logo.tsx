import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Logo() {
  return (
    <Link href="/">
      <a className="flex items-center">
        <motion.div 
          className="w-10 h-10 rounded-lg flex items-center justify-center animated-gradient"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </motion.div>
        <span className="ml-2 text-xl font-bold font-poppins text-primary">ShortLink</span>
      </a>
    </Link>
  );
}
