import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

const roleOptions = [
  "Founder/CEO",
  "Operations",
  "Sales",
  "Support",
  "Engineer",
  "Other",
];

const inquiryOptions = [
  "Automation Build (n8n)",
  "AI Assistant / Chatbot",
  "Integrations (CRM, email, Slack, Google, etc.)",
  "Reporting / Dashboards",
  "Website / Full-stack build",
  "Other",
];

const goalOptions = [
  "Save time / reduce manual work",
  "Increase lead conversion",
  "Improve customer support speed",
  "Fix internal ops bottlenecks",
  "Improve reporting visibility",
];

const toolOptions = [
  "Gmail / Outlook",
  "Google Sheets / Excel",
  "HubSpot / Salesforce",
  "Notion / Airtable",
  "Slack / Teams",
  "Shopify / Stripe",
  "Forms (Typeform, Google Forms)",
];

const volumeOptions = ["0–50", "51–200", "200–1000", "1000+"];
const timelineOptions = ["ASAP", "1–2 weeks", "3–6 weeks", "Flexible"];
const budgetOptions = [
  "< $500",
  "$500–$1,500",
  "$1,500–$5,000",
  "$5,000+",
  "Not sure yet",
];
const dataSensitivityOptions = ["Normal", "Sensitive (customer data)", "High compliance (finance/health/legal)"];
const contactMethodOptions = ["Email", "Phone"];

const leadSchema = z.object({
  name: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Enter a valid email" }),
  phone: z.string().optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  role: z.string().min(1, { message: "Select a role" }),
  inquiryType: z.string().min(1, { message: "Select an inquiry type" }),
  primaryGoal: z.string().min(1, { message: "Select a primary goal" }),
  tools: z.array(z.string()).optional(),
  toolsOther: z.string().optional().or(z.literal("")),
  volumeRange: z.string().min(1, { message: "Select monthly volume" }),
  timeline: z.string().min(1, { message: "Select a timeline" }),
  budgetRange: z.string().optional().or(z.literal("")),
  dataSensitivity: z.string().min(1, { message: "Select a data sensitivity" }),
  message: z.string().min(10, { message: "Tell me a bit more" }),
  attachments: z.string().optional().or(z.literal("")),
  preferredContact: z.string().optional().or(z.literal("Email")),
  consent: z.boolean().refine((value) => value === true, { message: "Consent is required" }),
  honeypot: z.string().optional().or(z.literal("")),
});

type LeadFormValues = z.infer<typeof leadSchema>;

type TrackingPayload = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  referrer: string;
  landing_page: string;
  page_path: string;
  timestamp: string;
  timezone: string;
  device_type: string;
  session_id: string;
};

type LeadPayload = {
  lead_source: "audit" | "message";
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  role: string;
  inquiry_type?: string;
  primary_goal?: string;
  tools_in_use?: string[];
  other_tools?: string;
  estimated_monthly_volume?: string;
  timeline?: string;
  budget_range?: string;
  data_sensitivity?: string;
  message: string;
  attachment_url?: string;
  preferred_contact_method?: string;
  consent: boolean;
  source_page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  client_meta?: Record<string, unknown>;
};

const stepFields: Array<Array<keyof LeadFormValues>> = [
  ["name", "email", "phone", "company", "role"],
  ["inquiryType", "primaryGoal", "tools", "toolsOther"],
  ["volumeRange", "timeline", "budgetRange", "dataSensitivity"],
  ["message", "attachments", "preferredContact", "consent"],
];

const Contact = () => {
  const [step, setStep] = useState(0);
  const [tracking, setTracking] = useState<TrackingPayload | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [auditStatus, setAuditStatus] = useState<string | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isAuditSending, setIsAuditSending] = useState(false);
  const [calendlyLink, setCalendlyLink] = useState<string | null>(null);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      role: "",
      inquiryType: "",
      primaryGoal: "",
      tools: [],
      toolsOther: "",
      volumeRange: "",
      timeline: "",
      budgetRange: "",
      dataSensitivity: "",
      message: "",
      attachments: "",
      preferredContact: "Email",
      consent: false,
      honeypot: "",
    },
  });

  const auditForm = useForm({
    defaultValues: {
      name: "",
      email: "",
      company: "",
      problem: "",
      consent: false,
      honeypot: "",
    },
  });

  const toolsSelected = form.watch("tools") || [];

  const buildTracking = () => {
    if (typeof window === "undefined") return null;

    const params = new URLSearchParams(window.location.search);
    const sessionKey = "lead_session_id";
    let sessionId = window.localStorage.getItem(sessionKey);
    if (!sessionId) {
      sessionId = `sess_${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(sessionKey, sessionId);
    }

    const width = window.innerWidth;
    const deviceType = width >= 1024 ? "desktop" : width >= 768 ? "tablet" : "mobile";

    return {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || "",
      referrer: document.referrer || "",
      landing_page: window.location.href,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      device_type: deviceType,
      session_id: sessionId,
    };
  };

  useEffect(() => {
    setTracking(buildTracking());
  }, []);

  const sendLead = async (payload: LeadPayload) => {
    const response = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Submission failed. Please try again.");
    }

    return data;
  };

  const normalizeOptional = (value?: string | null) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  };

  const onSubmit = async (data: LeadFormValues) => {
    if (!tracking) return;
    setStatusMessage(null);
    setStatusError(null);
    setIsSending(true);

    const tools = [...(data.tools || [])];
    if (data.toolsOther?.trim()) {
      tools.push(data.toolsOther.trim());
    }

    const payload: LeadPayload = {
      lead_source: "message",
      full_name: data.name,
      email: data.email,
      phone: normalizeOptional(data.phone),
      company: normalizeOptional(data.company),
      role: data.role,
      inquiry_type: data.inquiryType,
      primary_goal: data.primaryGoal,
      tools_in_use: tools.length ? tools : undefined,
      other_tools: normalizeOptional(data.toolsOther),
      estimated_monthly_volume: data.volumeRange,
      timeline: data.timeline,
      budget_range: normalizeOptional(data.budgetRange),
      data_sensitivity: data.dataSensitivity,
      message: data.message,
      attachment_url: normalizeOptional(data.attachments),
      preferred_contact_method: data.preferredContact || "Email",
      consent: data.consent,
      source_page: tracking.landing_page,
      utm_source: tracking.utm_source || undefined,
      utm_medium: tracking.utm_medium || undefined,
      utm_campaign: tracking.utm_campaign || undefined,
      utm_content: tracking.utm_content || undefined,
      utm_term: tracking.utm_term || undefined,
      client_meta: {
        session_id: tracking.session_id,
        device_type: tracking.device_type,
        timezone: tracking.timezone,
        referrer: tracking.referrer,
        page_path: tracking.page_path,
        honeypot: data.honeypot || "",
      },
    };

    try {
      const data = await sendLead(payload);
      // If the server returned a Calendly link, expose it to the user
      if (data?.calendlyLink) {
        setCalendlyLink(String(data.calendlyLink));
        setStatusMessage("✅ Request received. You can also book a strategy call:" );
      } else {
        setStatusMessage("✅ Got it — your request is in. Check your email in the next few minutes for confirmation and next steps.");
      }
      form.reset();
      setStep(0);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Something went wrong. Please email me directly.");
    } finally {
      setIsSending(false);
    }
  };

  const onAuditSubmit = async (data: any) => {
    if (!tracking) return;
    setAuditStatus(null);
    setAuditError(null);
    setIsAuditSending(true);

    if (!data.name || !data.email || !data.problem || !data.consent) {
      setAuditStatus("Please fill in name, email, problem, and consent.");
      setIsAuditSending(false);
      return;
    }

    const payload: LeadPayload = {
      lead_source: "audit",
      full_name: data.name,
      email: data.email,
      phone: normalizeOptional(data.phone),
      company: normalizeOptional(data.company),
      role: "Founder/CEO",
      inquiry_type: "Automation Build (n8n)",
      primary_goal: "Save time / reduce manual work",
      message: data.problem,
      consent: data.consent,
      source_page: tracking.landing_page,
      utm_source: tracking.utm_source || undefined,
      utm_medium: tracking.utm_medium || undefined,
      utm_campaign: tracking.utm_campaign || undefined,
      utm_content: tracking.utm_content || undefined,
      utm_term: tracking.utm_term || undefined,
      client_meta: {
        session_id: tracking.session_id,
        device_type: tracking.device_type,
        timezone: tracking.timezone,
        referrer: tracking.referrer,
        page_path: tracking.page_path,
        honeypot: data.honeypot || "",
      },
    };

    try {
      const data = await sendLead(payload);
      if (data?.calendlyLink) {
        setCalendlyLink(String(data.calendlyLink));
        setAuditStatus("✅ Strategy call request received. You can also book a slot below.");
      } else {
        setAuditStatus("✅ Strategy call request received. I’ll reply shortly with next steps.");
      }
      auditForm.reset();
    } catch (error) {
      setAuditError(error instanceof Error ? error.message : "Something went wrong. Please email me directly.");
    } finally {
      setIsAuditSending(false);
    }
  };

  const canGoNext = async () => {
    const fields = stepFields[step];
    const valid = await form.trigger(fields as any);
    if (valid) {
      setStep((prev) => Math.min(prev + 1, stepFields.length - 1));
    }
  };

  const canGoBack = () => setStep((prev) => Math.max(prev - 1, 0));

  const stepLabel = useMemo(() => {
    return ["Identity", "Needs", "Qualification", "Message"][step];
  }, [step]);

  return (
    <div className="container mx-auto px-4 py-20 sm:py-24 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
          Let’s build an automation system that saves time every week.
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-6">
          Tell me what you’re trying to automate — I’ll reply within 24 hours with next steps.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#audit"
            className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-all"
          >
            Book Free 45-minute Strategy Call
          </a>
          <a
            href="#message"
            className="px-6 py-3 rounded-xl bg-card border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all"
          >
            Send a Message
          </a>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          No spam. No sales pressure. Just systems thinking.
        </p>
      </motion.div>

      <div className="mb-8 sm:mb-10 rounded-2xl border border-border bg-card/80 p-6 sm:p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Book a Free 45-Minute Strategy Call</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Pick a time that works — you’ll get a Google Meet link instantly.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="px-6">
            <a href="#audit">Book a Call</a>
          </Button>
          <Button asChild variant="outline" className="px-6">
            <a href="#message">Send a Message</a>
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          In 45 minutes, I’ll map your automation opportunities + next steps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="contact-main">
        <div id="audit" className="bg-card/80 border border-border rounded-2xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Book a Free 45-Minute Strategy Call</h2>
          <p className="text-sm text-muted-foreground mb-6">
            For teams ready to automate a real workflow in the next 30–60 days.
          </p>

          <form
            onSubmit={auditForm.handleSubmit(onAuditSubmit)}
            className="space-y-4"
          >
            <Input placeholder="Full name" {...auditForm.register("name")} />
            <Input placeholder="Email" type="email" {...auditForm.register("email")} />
            <Input placeholder="Company (optional)" {...auditForm.register("company")} />
            <Textarea
              placeholder="What are you trying to automate?"
              className="min-h-[120px]"
              {...auditForm.register("problem")}
            />
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
              {...auditForm.register("honeypot")}
            />
            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <Checkbox
                checked={auditForm.watch("consent")}
                onCheckedChange={(value) => auditForm.setValue("consent", Boolean(value))}
              />
              <span>I agree to be contacted about this request.</span>
            </label>
            <Button type="submit" className="w-full" disabled={isAuditSending}>
              {isAuditSending ? "Sending..." : "Book a Call"}
            </Button>
            <p className="text-xs text-muted-foreground">
              You’ll hear back within 24 hours with next steps or clarifying questions.
            </p>
            {auditStatus ? (
              <p className="text-xs text-muted-foreground">{auditStatus}</p>
            ) : null}
            {auditError ? (
              <p className="text-xs text-destructive">
                {auditError} If needed, email me at{" "}
                <a className="underline" href="mailto:jeffaddai40@gmail.com">
                  jeffaddai40@gmail.com
                </a>
                .
              </p>
            ) : null}
          </form>
        </div>

        <div id="message" className="bg-card/80 border border-border rounded-2xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Describe Your Process</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Not sure yet? Describe what’s slowing you down — I’ll map the workflow.
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground mb-6">
            <span>Step {step + 1} of 4</span>
            <span>{stepLabel}</span>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 0 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="name@company.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company / Organization (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Company" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roleOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="inquiryType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inquiry type</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select inquiry type" />
                            </SelectTrigger>
                            <SelectContent>
                              {inquiryOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="primaryGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary goal</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select primary goal" />
                            </SelectTrigger>
                            <SelectContent>
                              {goalOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tools"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Where is the process happening today?</FormLabel>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {toolOptions.map((tool) => {
                            const checked = toolsSelected.includes(tool);
                            return (
                              <label
                                key={tool}
                                className="flex items-center gap-3 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground"
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(value) => {
                                    const next = value
                                      ? [...toolsSelected, tool]
                                      : toolsSelected.filter((item) => item !== tool);
                                    field.onChange(next);
                                  }}
                                />
                                <span>{tool}</span>
                              </label>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="toolsOther"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Other tools (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Add any other tools" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="volumeRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated monthly volume</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select volume" />
                            </SelectTrigger>
                            <SelectContent>
                              {volumeOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="timeline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeline</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timeline" />
                            </SelectTrigger>
                            <SelectContent>
                              {timelineOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="budgetRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comfortable budget range (helps me propose the right solution)</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select budget" />
                            </SelectTrigger>
                            <SelectContent>
                              {budgetOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dataSensitivity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data sensitivity</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select data sensitivity" />
                            </SelectTrigger>
                            <SelectContent>
                              {dataSensitivityOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the workflow you want to automate"
                            className="min-h-[140px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="attachments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attachments (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Paste a Loom or doc link" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferredContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Best way to reach you</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              {contactMethodOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="honeypot"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input
                            tabIndex={-1}
                            autoComplete="off"
                            aria-hidden="true"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="consent"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm text-muted-foreground">
                            I agree to be contacted about this request.
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <Button type="button" variant="outline" onClick={canGoBack} disabled={step === 0}>
                  Back
                </Button>
                {step < stepFields.length - 1 ? (
                  <Button type="button" onClick={canGoNext} disabled={isSending}>
                    Continue
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSending}>
                    {isSending ? "Sending..." : "Send Message"}
                  </Button>
                )}
              </div>

              {statusMessage ? (
                <div className="flex flex-col items-start gap-2">
                  <p className="text-sm text-muted-foreground">{statusMessage}</p>
                  {calendlyLink ? (
                    <a
                      className="inline-block mt-1 px-4 py-2 rounded-md bg-primary text-white"
                      href={calendlyLink}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Book a strategy call
                    </a>
                  ) : null}
                </div>
              ) : null}
              {statusError ? (
                <p className="text-sm text-destructive">
                  {statusError} If needed, email me at{" "}
                  <a className="underline" href="mailto:jeffaddai40@gmail.com">
                    jeffaddai40@gmail.com
                  </a>
                  .
                </p>
              ) : null}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
