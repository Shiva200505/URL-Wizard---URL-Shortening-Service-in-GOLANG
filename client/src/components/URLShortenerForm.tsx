import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useClipboard } from "@/hooks/use-clipboard";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link2, Copy, Check, Share2, QrCode } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Form schema for URL shortening
const urlFormSchema = z.object({
  originalUrl: z.string().url("Please enter a valid URL").min(1, "URL is required"),
  customSlug: z.string().regex(/^[a-zA-Z0-9-_]*$/, {
    message: "Slug can only contain letters, numbers, hyphens, and underscores",
  }).max(50, "Slug must be 50 characters or less").optional(),
  expiresAt: z.string().optional(),
});

type UrlFormValues = z.infer<typeof urlFormSchema>;

interface ShortenedURLResultProps {
  shortUrl: string;
  isActive: boolean;
}

const ShortenedURLResult = ({ shortUrl, isActive }: ShortenedURLResultProps) => {
  const { copy, copied } = useClipboard();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="flex-grow mb-4 sm:mb-0">
          <p className="text-sm text-gray-500 mb-1">Your shortened URL:</p>
          <div className="flex items-center">
            <a 
              href={shortUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-lg font-medium text-primary hover:underline"
            >
              {shortUrl}
            </a>
            <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copy(shortUrl)}
            className="flex items-center"
          >
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Shortened URL',
                  text: 'Check out this link:',
                  url: shortUrl,
                });
              }
            }}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center">
                  <QrCode className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate QR code for this link</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </motion.div>
  );
};

export default function URLShortenerForm() {
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { copy } = useClipboard();
  
  const form = useForm<UrlFormValues>({
    resolver: zodResolver(urlFormSchema),
    defaultValues: {
      originalUrl: "",
      customSlug: "",
      expiresAt: "never",
    },
  });

  const createShortUrlMutation = useMutation({
    mutationFn: (data: { originalUrl: string; slug: string; expiresAt: string | null }) => 
      apiRequest("POST", "/api/urls", data),
    onSuccess: async (response) => {
      const data = await response.json();
      const host = window.location.origin;
      const shortUrl = `${host}/api/r/${data.slug}`;
      
      setShortenedUrl(shortUrl);
      toast({
        title: "URL shortened successfully!",
        description: "Your link is now ready to share.",
        variant: "success",
      });
    },
    onError: (error) => {
      console.error("Error shortening URL:", error);
      toast({
        title: "Error shortening URL",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: UrlFormValues) => {
    let expiresAt: string | null = null;
    
    // Handle expiry date calculation
    switch (values.expiresAt) {
      case "1day":
        expiresAt = new Date(Date.now() + 86400000).toISOString(); // 24 hours
        break;
      case "7days":
        expiresAt = new Date(Date.now() + 604800000).toISOString(); // 7 days
        break;
      case "30days":
        expiresAt = new Date(Date.now() + 2592000000).toISOString(); // 30 days
        break;
      case "never":
      default:
        expiresAt = null;
        break;
    }
    
    createShortUrlMutation.mutate({
      originalUrl: values.originalUrl,
      slug: values.customSlug || "",
      expiresAt
    });
  };

  return (
    <Card className="bg-white rounded-xl shadow-md p-6 mb-12">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="originalUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">Your Long URL</FormLabel>
                <FormControl>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <Input
                      placeholder="https://example.com/your-very-long-url-that-needs-shortening"
                      className="pr-12 py-3"
                      {...field}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Link2 className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <FormField
              control={form.control}
              name="customSlug"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel className="text-sm font-medium text-gray-700">Custom Slug (Optional)</FormLabel>
                  <FormControl>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        {window.location.origin}/api/r/
                      </span>
                      <Input
                        placeholder="my-custom-link"
                        className="flex-grow block w-full min-w-0 rounded-none rounded-r-md"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Expiry (Optional)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Select expiry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="1day">1 Day</SelectItem>
                      <SelectItem value="7days">7 Days</SelectItem>
                      <SelectItem value="30days">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-center">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button 
                type="submit"
                size="lg"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 transition-all duration-200 ease-in-out"
                disabled={createShortUrlMutation.isPending}
              >
                {createShortUrlMutation.isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Shorten URL
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </form>
      </Form>

      <AnimatePresence>
        {shortenedUrl && (
          <ShortenedURLResult shortUrl={shortenedUrl} isActive={true} />
        )}
      </AnimatePresence>
    </Card>
  );
}
