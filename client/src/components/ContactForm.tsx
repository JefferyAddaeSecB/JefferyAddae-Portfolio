import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firestore, isFirebaseConfigured } from "@/lib/firebase";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  company?: string;
  role?: string;
  website?: string;
  tools?: string;
  urgency?: string;
}

interface FormErrors {
  [key: string]: string;
}

const ContactForm = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
    company: "",
    role: "",
    website: "",
    tools: "",
    urgency: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!isFirebaseConfigured) {
      setErrors({
        submit: "Form is not configured yet. Please try again later or email directly.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        company: formData.company?.trim() || "",
        role: formData.role?.trim() || "",
        website: formData.website?.trim() || "",
        tools: formData.tools || "",
        urgency: formData.urgency || "",
        source: "portfolio-contact",
        status: "new",
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
        createdAt: serverTimestamp(),
      };

      const timeoutPromise = new Promise((_, reject) => {
        window.setTimeout(() => reject(new Error("timeout")), 10000);
      });

      await Promise.race([
        addDoc(collection(firestore, "contactMessages"), payload),
        timeoutPromise,
      ]);
      setErrors({});
      setSubmitted(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
        company: "",
        role: "",
        website: "",
        tools: "",
        urgency: "",
      });
      setTimeout(() => {
        setSubmitted(false);
      }, 15000);
    } catch (error) {
      const errorCode = (error as { code?: string })?.code ?? "unknown";
      console.error("Contact form submission failed:", error);
      const isPermissionError = errorCode === "permission-denied";
      const message = isPermissionError
        ? "Message could not be saved. Firestore rules may be blocking writes."
        : "Something went wrong while sending. Please try again or email directly.";
      setErrors({
        submit: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-6 text-center">
        <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">
          Message sent!
        </h3>
        <p className="text-green-800 dark:text-green-200 text-sm mb-4">
          Thanks for reaching out. I'll reply within 24 hours.
        </p>
        <p className="text-sm text-green-700 dark:text-green-300">
          Prefer a call? <a href="#booking" className="underline font-semibold hover:no-underline">Book the ROI Audit</a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {errors.submit && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded p-3">
          <p className="text-sm text-red-800 dark:text-red-200">{errors.submit}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" className="text-sm font-medium">
            First Name *
          </Label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
            className={errors.firstName ? "border-red-500" : ""}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
          />
          {errors.firstName && (
            <p id="firstName-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
              {errors.firstName}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="lastName" className="text-sm font-medium">
            Last Name *
          </Label>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
            className={errors.lastName ? "border-red-500" : ""}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
          />
          {errors.lastName && (
            <p id="lastName-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email" className="text-sm font-medium">
          Email *
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
          className={errors.email ? "border-red-500" : ""}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
            {errors.email}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company" className="text-sm font-medium">
            Company
          </Label>
          <Input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            value={formData.company}
            onChange={handleChange}
            placeholder="Acme Inc"
          />
        </div>

        <div>
          <Label htmlFor="role" className="text-sm font-medium">
            Role / Title
          </Label>
          <Input
            id="role"
            name="role"
            type="text"
            autoComplete="organization-title"
            value={formData.role}
            onChange={handleChange}
            placeholder="Operations Manager"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label id="tools-label" className="text-sm font-medium">
            Tools involved
          </Label>
          <Select value={formData.tools} onValueChange={(value) => handleSelectChange("tools", value)}>
            <SelectTrigger id="tools" aria-labelledby="tools-label">
              <SelectValue placeholder="Select tools" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sheets">Google Sheets</SelectItem>
              <SelectItem value="crm">CRM (HubSpot, Salesforce, etc)</SelectItem>
              <SelectItem value="email">Email / Email Marketing</SelectItem>
              <SelectItem value="calendly">Calendly / Scheduling</SelectItem>
              <SelectItem value="forms">Forms (Gravity Forms, Jotform, etc)</SelectItem>
              <SelectItem value="zapier">Zapier / Automation Tools</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="unsure">Not sure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label id="urgency-label" className="text-sm font-medium">
            How soon?
          </Label>
          <Select value={formData.urgency} onValueChange={(value) => handleSelectChange("urgency", value)}>
            <SelectTrigger id="urgency" aria-labelledby="urgency-label">
              <SelectValue placeholder="Select timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asap">ASAP (this week)</SelectItem>
              <SelectItem value="soon">Soon (next 2 weeks)</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
              <SelectItem value="exploring">Just exploring</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="message" className="text-sm font-medium">
          Message *
        </Label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="What's on your mind? Questions, feedback, or just want to chat..."
          rows={5}
          className={`w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            errors.message ? "border-red-500" : "border-input"
          }`}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && (
          <p id="message-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
            {errors.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full sm:w-auto"
      >
        {isLoading ? "Sending..." : "Send Message"}
      </Button>

      <p className="text-xs text-muted-foreground">
        * Required fields
      </p>
    </form>
  );
};

export default ContactForm;
