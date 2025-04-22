import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart2, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FaTwitter, 
  FaFacebookF, 
  FaInstagram, 
  FaLinkedinIn, 
  FaGlobe 
} from "react-icons/fa";

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30days");
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics"],
  });

  const getDevicePercentage = (device: string) => {
    if (!analytics?.deviceStats) return 0;
    const total = 
      analytics.deviceStats.mobile + 
      analytics.deviceStats.desktop + 
      analytics.deviceStats.tablet;
    
    if (total === 0) return 0;
    return Math.round((analytics.deviceStats[device as keyof typeof analytics.deviceStats] / total) * 100);
  };

  const getReferrerPercentage = (referrer: string) => {
    if (!analytics?.referrerStats) return 0;
    const total = Object.values(analytics.referrerStats).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    return Math.round(((analytics.referrerStats[referrer] || 0) / total) * 100);
  };

  // Mock chart data for visualization
  const chartData = [
    { date: "Jun 1", clicks: 120 },
    { date: "Jun 5", clicks: 140 },
    { date: "Jun 10", clicks: 80 },
    { date: "Jun 15", clicks: 160 },
    { date: "Jun 20", clicks: 200 },
    { date: "Jun 25", clicks: 180 },
    { date: "Jun 30", clicks: 220 },
  ];

  // Find the maximum value to normalize the chart heights
  const maxClicks = Math.max(...chartData.map(item => item.clicks));

  const topReferrers = [
    { name: "Twitter", percentage: getReferrerPercentage('twitter'), icon: <FaTwitter />, color: "text-blue-500", bgColor: "bg-blue-100", barColor: "bg-blue-500" },
    { name: "Facebook", percentage: getReferrerPercentage('facebook'), icon: <FaFacebookF />, color: "text-blue-800", bgColor: "bg-blue-100", barColor: "bg-blue-800" },
    { name: "Instagram", percentage: getReferrerPercentage('instagram'), icon: <FaInstagram />, color: "text-red-500", bgColor: "bg-red-100", barColor: "bg-red-500" },
    { name: "LinkedIn", percentage: getReferrerPercentage('linkedin'), icon: <FaLinkedinIn />, color: "text-blue-600", bgColor: "bg-blue-100", barColor: "bg-blue-600" },
    { name: "Other", percentage: getReferrerPercentage('other') + getReferrerPercentage('direct'), icon: <FaGlobe />, color: "text-gray-500", bgColor: "bg-gray-100", barColor: "bg-gray-500" },
  ];

  const mobilePercentage = getDevicePercentage('mobile');
  const desktopPercentage = getDevicePercentage('desktop');
  const tabletPercentage = getDevicePercentage('tablet');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-poppins text-gray-900 flex items-center">
          <BarChart2 className="mr-2 text-primary" />
          Analytics Overview
        </h2>
        <div className="flex space-x-2">
          <Select 
            value={timeRange} 
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="12months">Last 12 months</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900">Traffic Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg">
                <div className="relative" style={{ height: "300px" }}>
                  {/* Chart visualization */}
                  <div className="absolute inset-0 flex items-end px-4">
                    <div className="w-full flex justify-between items-end">
                      {chartData.map((item, index) => (
                        <motion.div 
                          key={index} 
                          className="flex flex-col items-center"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ 
                            height: "auto", 
                            opacity: 1 
                          }}
                          transition={{ 
                            duration: 0.5,
                            delay: index * 0.1 
                          }}
                        >
                          <motion.div 
                            className="w-10 bg-primary rounded-t-md"
                            initial={{ height: 0 }}
                            animate={{ 
                              height: `${(item.clicks / maxClicks) * 220}px`
                            }}
                            transition={{ 
                              duration: 0.8,
                              delay: 0.3 + (index * 0.1),
                              type: "spring" 
                            }}
                          ></motion.div>
                          <span className="text-xs text-gray-500 mt-1">{item.date}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Y-axis labels */}
                  <div className="absolute inset-y-0 left-0 flex flex-col justify-between py-4">
                    <span className="text-xs text-gray-500">500</span>
                    <span className="text-xs text-gray-500">400</span>
                    <span className="text-xs text-gray-500">300</span>
                    <span className="text-xs text-gray-500">200</span>
                    <span className="text-xs text-gray-500">100</span>
                    <span className="text-xs text-gray-500">0</span>
                  </div>
                </div>
                
                <div className="flex justify-center mt-4">
                  <div className="flex items-center mx-2">
                    <div className="w-3 h-3 bg-primary rounded-full mr-1"></div>
                    <span className="text-sm text-gray-600">Clicks</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900">Top Referrers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topReferrers.map((referrer, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ 
                      duration: 0.5,
                      delay: 0.4 + (index * 0.1) 
                    }}
                  >
                    <div className={`w-8 h-8 rounded-full ${referrer.bgColor} flex items-center justify-center ${referrer.color} mr-3`}>
                      {referrer.icon}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{referrer.name}</span>
                        <span className="text-sm font-medium text-gray-500">{referrer.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div 
                          className={`${referrer.barColor} h-2 rounded-full`} 
                          initial={{ width: 0 }}
                          animate={{ width: `${referrer.percentage}%` }}
                          transition={{ duration: 1, delay: 0.6 + (index * 0.1) }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Device Breakdown</h3>
                <div className="flex items-center justify-center">
                  {/* Donut Chart */}
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      {/* Background Circle */}
                      <path 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        fill="none" 
                        stroke="#eee" 
                        strokeWidth="3" 
                      />
                      
                      {/* Mobile Segment */}
                      <motion.path 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        fill="none" 
                        stroke="#3B82F6" 
                        strokeWidth="3" 
                        initial={{ strokeDasharray: "0, 100" }}
                        animate={{ strokeDasharray: `${mobilePercentage}, 100` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                      
                      {/* Desktop Segment */}
                      <motion.path 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        fill="none" 
                        stroke="#10B981" 
                        strokeWidth="3" 
                        initial={{ strokeDasharray: "0, 100", strokeDashoffset: "0" }}
                        animate={{ 
                          strokeDasharray: `${desktopPercentage}, 100`,
                          strokeDashoffset: `-${mobilePercentage}` 
                        }}
                        transition={{ duration: 1, delay: 0.7 }}
                      />
                      
                      {/* Tablet Segment */}
                      <motion.path 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        fill="none" 
                        stroke="#6366F1" 
                        strokeWidth="3"
                        initial={{ strokeDasharray: "0, 100", strokeDashoffset: "0" }}
                        animate={{ 
                          strokeDasharray: `${tabletPercentage}, 100`,
                          strokeDashoffset: `-${mobilePercentage + desktopPercentage}` 
                        }}
                        transition={{ duration: 1, delay: 0.9 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-800">{mobilePercentage}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4 mt-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary rounded-full mr-1"></div>
                    <span className="text-xs text-gray-600">Mobile</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-secondary rounded-full mr-1"></div>
                    <span className="text-xs text-gray-600">Desktop</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-accent rounded-full mr-1"></div>
                    <span className="text-xs text-gray-600">Tablet</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
