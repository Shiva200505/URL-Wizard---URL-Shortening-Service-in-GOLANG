import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useClipboard } from "@/hooks/use-clipboard";
import { formatDistanceToNow } from "date-fns";
import { 
  Copy, 
  ChevronRight, 
  BarChart2, 
  Edit, 
  Trash2, 
  History, 
  ExternalLink
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";

type ShortUrl = {
  id: number;
  originalUrl: string;
  slug: string;
  clicks: number;
  active: boolean;
  createdAt: string;
  expiresAt: string | null;
};

export default function RecentLinks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { copy } = useClipboard();
  const [deleteUrlId, setDeleteUrlId] = useState<number | null>(null);
  const { user } = useAuth();

  const { data: links = [], isLoading } = useQuery<ShortUrl[]>({
    queryKey: ["/api/urls"],
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/urls/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/urls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Link deleted",
        description: "The link has been successfully deleted.",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting link",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  const handleCopyLink = (slug: string) => {
    const shortUrl = `${window.location.origin}/api/r/${slug}`;
    copy(shortUrl);
    toast({
      title: "Link copied!",
      description: "The shortened URL has been copied to your clipboard.",
      variant: "success",
    });
  };

  const handleDeleteLink = (id: number) => {
    setDeleteUrlId(id);
  };

  const confirmDelete = () => {
    if (deleteUrlId !== null) {
      deleteMutation.mutate(deleteUrlId);
      setDeleteUrlId(null);
    }
  };

  const getStatusBadge = (url: ShortUrl) => {
    if (!url.active) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
          Inactive
        </span>
      );
    }
    
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
          Expired
        </span>
      );
    }
    
    const now = new Date();
    const expiry = url.expiresAt ? new Date(url.expiresAt) : null;
    
    if (expiry && ((expiry.getTime() - now.getTime()) < 86400000 * 3)) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Expiring Soon
        </span>
      );
    }
    
    return (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
        Active
      </span>
    );
  };

  const truncateUrl = (url: string, maxLength: number = 40) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-poppins text-gray-900 flex items-center">
          <History className="mr-2 text-primary" />
          Recent Links
        </h2>
        <Button
          variant="ghost"
          className="text-primary hover:text-primary-dark font-medium flex items-center transition-colors"
        >
          View All
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      <Card className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Original URL
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Short Link
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clicks
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                // Skeleton loading state
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-12" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <ExternalLink className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-lg font-medium">No links created yet</p>
                      <p className="text-sm max-w-md mx-auto">
                        Create your first shortened URL using the form above
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {links.map((link, index) => (
                    <motion.tr
                      key={link.id}
                      className="hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center max-w-xs">
                          <span 
                            className="text-sm font-medium text-gray-900 truncate" 
                            title={link.originalUrl}
                          >
                            {truncateUrl(link.originalUrl)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-primary font-medium">
                          <a 
                            href={`/api/r/${link.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            shortlink.io/{link.slug}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {link.clicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(link)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyLink(link.slug)}
                            className="text-gray-500 hover:text-primary transition-colors"
                            title="Copy link"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-primary transition-colors"
                            title="Edit link"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteLink(link.id)}
                            className="text-gray-500 hover:text-red-500 transition-colors"
                            title="Delete link"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AlertDialog open={deleteUrlId !== null} onOpenChange={() => setDeleteUrlId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this link and all associated analytics data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
