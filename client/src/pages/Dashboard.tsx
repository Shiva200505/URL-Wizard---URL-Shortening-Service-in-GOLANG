import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import StatsOverview from "@/components/StatsOverview";
import RecentLinks from "@/components/RecentLinks";
import Footer from "@/components/Footer";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <StatsOverview />
            <RecentLinks />
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
