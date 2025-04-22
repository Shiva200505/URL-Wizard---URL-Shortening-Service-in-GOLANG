import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import URLShortenerForm from "@/components/URLShortenerForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold font-poppins text-gray-900 mb-4">
              Shorten Your Links, <span className="text-primary">Expand Your Reach</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Create short, memorable links that redirect to your original URLs. 
              Track click statistics and customize your links with our easy-to-use platform.
            </p>
          </motion.div>
          
          <URLShortenerForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
