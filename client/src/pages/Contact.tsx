import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" })
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: ""
    }
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast({
          title: "Message sent successfully!",
          description: "I'll get back to you as soon as possible.",
          variant: "default",
          className: "animate-in slide-in-from-top-4 duration-500",
          style: {
            background: "hsl(var(--ghana-green))",
            color: "white",
            border: "none",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "1rem",
            borderRadius: "0.5rem",
            fontSize: "1rem",
            fontWeight: "500"
          }
        });
        form.reset();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
        className: "animate-in slide-in-from-top-4 duration-500",
        style: {
          background: "hsl(var(--ghana-red))",
          color: "white",
          border: "none",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          padding: "1rem",
          borderRadius: "0.5rem",
          fontSize: "1rem",
          fontWeight: "500"
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-24 relative">
      {/* Background gradient effects */}
      <div className="bg-gradient-1 absolute w-[400px] h-[400px] -top-20 -left-20 opacity-20 z-0"></div>
      <div className="bg-gradient-2 absolute w-[400px] h-[400px] -bottom-20 -right-20 opacity-20 z-0"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16 relative z-10"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">LET'S TALK</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Interested in working together or starting a project? Let's connect! Fill
          out the form below or reach out directly through the contact information.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card/80 backdrop-blur-sm p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
          >
            <div className="flex space-x-4">
              <div className="text-primary bg-primary/10 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
              </div>
              <div>
                <h3 className="text-foreground font-bold mb-1">Email</h3>
                <p className="text-muted-foreground">jeffery.addae@example.com</p>
                <button 
                  className="text-primary p-0 h-auto mt-2 hover:text-primary/80 transition-colors bg-transparent border-0 cursor-pointer inline-flex items-center"
                  onClick={() => window.location.href = "mailto:jeffery.addae@example.com"}
                >
                  Send an email
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card/80 backdrop-blur-sm p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
          >
            <div className="flex space-x-4">
              <div className="text-primary bg-primary/10 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <div>
                <h3 className="text-foreground font-bold mb-1">Phone</h3>
                <p className="text-muted-foreground">+1 (416) 555-0123</p>
                <button 
                  className="text-primary p-0 h-auto mt-2 hover:text-primary/80 transition-colors bg-transparent border-0 cursor-pointer inline-flex items-center"
                  onClick={() => window.location.href = "tel:+14165550123"}
                >
                  Make a call
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-card/80 backdrop-blur-sm p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
          >
            <div className="flex space-x-4">
              <div className="text-primary bg-primary/10 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <div>
                <h3 className="text-foreground font-bold mb-1">Location</h3>
                <p className="text-muted-foreground">Canada</p>
                <button 
                  className="text-primary p-0 h-auto mt-2 hover:text-primary/80 transition-colors bg-transparent border-0 cursor-pointer inline-flex items-center"
                  onClick={() => window.open("https://www.google.com/maps/place/Canada", "_blank")}
                >
                  View on map
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-card/80 backdrop-blur-sm p-6 rounded-xl border border-border/50"
          >
            <h3 className="text-foreground font-bold mb-4">Connect With Me</h3>
            <div className="flex space-x-4">
              <a href="https://github.com/jeffery-addae" target="_blank" rel="noopener noreferrer" title="GitHub Profile" className="text-muted-foreground hover:text-primary transition-colors p-2 bg-background/50 rounded-lg hover:bg-primary/10">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
              </a>
              <a href="https://www.linkedin.com/in/jeffery-addae/" target="_blank" rel="noopener noreferrer" title="LinkedIn Profile" className="text-muted-foreground hover:text-primary transition-colors p-2 bg-background/50 rounded-lg hover:bg-primary/10">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="https://x.com/jeffery_addae" target="_blank" rel="noopener noreferrer" title="X (Twitter) Profile" className="text-muted-foreground hover:text-primary transition-colors p-2 bg-background/50 rounded-lg hover:bg-primary/10">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="mailto:jeffery.addae@example.com" title="Email" className="text-muted-foreground hover:text-primary transition-colors p-2 bg-background/50 rounded-lg hover:bg-primary/10">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2 bg-card/80 backdrop-blur-sm p-8 rounded-xl border border-border/50 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-foreground mb-6">Send a Message</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Your Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Full Name" 
                          {...field} 
                          className="bg-background/50 border-border focus:border-primary transition-colors h-12" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Your Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Valid Email Address" 
                          {...field} 
                          className="bg-background/50 border-border focus:border-primary transition-colors h-12" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Subject</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Project Inquiry or IT Support Request" 
                        {...field} 
                        className="bg-background/50 border-border focus:border-primary transition-colors h-12" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Your Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="I'd like to discuss a project or need IT system support..." 
                        className="min-h-[150px] bg-background/50 border-border focus:border-primary transition-colors resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-black font-semibold h-12 text-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;