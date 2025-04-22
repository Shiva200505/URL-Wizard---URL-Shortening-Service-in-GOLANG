import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChartLine } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, Equal, LinkIcon, MousePointerIcon, PercentIcon, BoltIcon } from "lucide-react";

interface StatsItem {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  change: number;
  period: string;
}

export default function StatsOverview() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics"],
  });
  
  // Animations for cards
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } }
  };

  // Default stats if data is not available
  const statsItems: StatsItem[] = [
    {
      title: "Total Links",
      value: analytics?.totalLinks || 0,
      icon: <LinkIcon className="h-5 w-5" />,
      iconBgColor: "bg-blue-100",
      iconColor: "text-primary",
      change: analytics?.totalLinks ? 12 : 0,
      period: "vs last month"
    },
    {
      title: "Total Clicks",
      value: analytics?.totalClicks || 0,
      icon: <MousePointerIcon className="h-5 w-5" />,
      iconBgColor: "bg-green-100",
      iconColor: "text-secondary",
      change: analytics?.totalClicks ? 8.2 : 0,
      period: "vs last month"
    },
    {
      title: "Average CTR",
      value: "5.2%",
      icon: <PercentIcon className="h-5 w-5" />,
      iconBgColor: "bg-indigo-100",
      iconColor: "text-accent",
      change: -2.1,
      period: "vs last month"
    },
    {
      title: "Active Links",
      value: analytics?.activeLinks || 0,
      icon: <BoltIcon className="h-5 w-5" />,
      iconBgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
      change: 0,
      period: "vs last month"
    }
  ];

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold font-poppins text-gray-900 mb-6 flex items-center">
        <ChartLine className="mr-2 text-primary" />
        Your Link Stats
      </h2>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {statsItems.map((stat, index) => (
          <motion.div key={index} variants={item}>
            <Card className="bg-white rounded-xl shadow-md p-6 card-hover">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <h3 className="mt-1 text-3xl font-semibold text-gray-900">
                    {isLoading ? (
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      stat.value
                    )}
                  </h3>
                </div>
                <div className={`w-10 h-10 rounded-full ${stat.iconBgColor} flex items-center justify-center ${stat.iconColor}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {stat.change > 0 ? (
                  <span className="text-green-500 text-sm font-medium flex items-center">
                    <ArrowUpIcon className="mr-1 h-4 w-4" />
                    {stat.change}%
                  </span>
                ) : stat.change < 0 ? (
                  <span className="text-red-500 text-sm font-medium flex items-center">
                    <ArrowDownIcon className="mr-1 h-4 w-4" />
                    {Math.abs(stat.change)}%
                  </span>
                ) : (
                  <span className="text-gray-500 text-sm font-medium flex items-center">
                    <Equal className="mr-1 h-4 w-4" />
                    0%
                  </span>
                )}
                <span className="text-gray-400 text-sm ml-2">{stat.period}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
