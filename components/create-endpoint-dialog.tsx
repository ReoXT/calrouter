"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Copy, CheckCircle2, Sparkles, Link2, Zap, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const endpointSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  destination_url: z
    .string()
    .url("Must be a valid URL")
    .startsWith("https://", "Must be an HTTPS URL"),
  enable_reschedule_detection: z.boolean().default(true),
  enable_utm_tracking: z.boolean().default(true),
  enable_question_parsing: z.boolean().default(true),
  is_active: z.boolean().default(true),
});

type EndpointFormData = z.infer<typeof endpointSchema>;

interface CreateEndpointDialogProps {
  onSuccess?: (endpoint: any) => void;
}

export function CreateEndpointDialog({ onSuccess }: CreateEndpointDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdEndpoint, setCreatedEndpoint] = useState<any>(null);

  /**
   * DIALOG DIMENSIONS - Easily adjustable
   *
   * To make the dialog more square, increase both values proportionally:
   * - For a square look: DIALOG_WIDTH = "700px", DIALOG_MAX_HEIGHT = "90vh"
   * - For wider: DIALOG_WIDTH = "800px", DIALOG_MAX_HEIGHT = "85vh"
   * - For taller: DIALOG_WIDTH = "640px", DIALOG_MAX_HEIGHT = "95vh"
   * - For larger square: DIALOG_WIDTH = "900px", DIALOG_MAX_HEIGHT = "95vh"
   */
  const DIALOG_WIDTH = "640px";
  const DIALOG_MAX_HEIGHT = "85vh";

  const form = useForm<EndpointFormData>({
    resolver: zodResolver(endpointSchema),
    defaultValues: {
      name: "",
      destination_url: "",
      enable_reschedule_detection: true,
      enable_utm_tracking: true,
      enable_question_parsing: true,
      is_active: true,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = form;

  const watchedValues = watch();

  const onSubmit = async (data: EndpointFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/endpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create endpoint");
      }

      const endpoint = await response.json();
      setCreatedEndpoint(endpoint);
      toast.success("Endpoint created successfully!");
      onSuccess?.(endpoint);

      // Don't close dialog yet - show success state first
    } catch (error) {
      console.error("Error creating endpoint:", error);
      toast.error("Failed to create endpoint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCreatedEndpoint(null);
    reset();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex shrink-0 items-center gap-2 h-11 px-5 shadow-lg shadow-primary/25">
          <Plus className="h-5 w-5" />
          <span>Create Endpoint</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="bg-card border-border shadow-2xl ring-1 ring-border/50 p-0 overflow-hidden flex flex-col"
        style={{
          maxWidth: DIALOG_WIDTH,
          width: '90vw',
          maxHeight: DIALOG_MAX_HEIGHT,
          height: 'auto'
        }}
        showCloseButton={!createdEndpoint}
      >
        {!createdEndpoint ? (
          <>
            {/* Modal Header */}
            <DialogHeader className="px-8 py-6 border-b border-border bg-muted/30">
              <DialogTitle className="text-xl font-bold tracking-tight">
                Create New Endpoint
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Configure a new destination for your incoming webhooks.
              </DialogDescription>
            </DialogHeader>

            {/* Modal Body */}
            <div className="p-8 flex flex-col gap-8 overflow-y-auto flex-1">
              {/* Basic Configuration */}
              <div className="flex flex-col gap-5">
                {/* Endpoint Name */}
                <div className="flex flex-col gap-2">
                  <Label className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase pl-1">
                    Endpoint Name
                  </Label>
                  <Input
                    {...register("name")}
                    placeholder="e.g. Production Stripe Listener"
                    className="w-full bg-background border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium shadow-inner h-auto"
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive pl-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Destination URL */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center pl-1">
                    <Label className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
                      Destination URL
                    </Label>
                    <button
                      type="button"
                      className="text-xs text-primary flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      Test connection
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Link2 className="h-[18px] w-[18px] text-muted-foreground" />
                    </div>
                    <Input
                      {...register("destination_url")}
                      placeholder="https://"
                      className="w-full font-mono text-[13px] bg-background border-border rounded-lg pl-10 pr-10 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner h-auto"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <CheckCircle2 className="h-[18px] w-[18px] text-emerald-500" />
                    </div>
                  </div>
                  {errors.destination_url && (
                    <p className="text-xs text-destructive pl-1">
                      {errors.destination_url.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Enrichment Features Section (Purple Zone) */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-1 relative overflow-hidden group">
                {/* Decorative gradient blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                <div className="px-5 py-4 border-b border-primary/10 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-bold tracking-wide">Data Enrichment</h3>
                  </div>
                  <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-primary/20">
                    Pro
                  </span>
                </div>

                <div className="p-2 grid gap-1 relative z-10">
                  {/* Reschedule Detection */}
                  <label className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer group/item">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium group-hover/item:text-primary transition-colors">
                        Reschedule Detection
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Detect when someone reschedules instead of canceling
                      </span>
                    </div>
                    <Switch
                      checked={watchedValues.enable_reschedule_detection}
                      onCheckedChange={(checked) =>
                        setValue("enable_reschedule_detection", checked)
                      }
                    />
                  </label>

                  {/* UTM Tracking */}
                  <label className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer group/item">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium group-hover/item:text-primary transition-colors">
                        UTM Tracking
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Extract lead source data from booking URLs
                      </span>
                    </div>
                    <Switch
                      checked={watchedValues.enable_utm_tracking}
                      onCheckedChange={(checked) =>
                        setValue("enable_utm_tracking", checked)
                      }
                    />
                  </label>

                  {/* Question Parsing */}
                  <label className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer group/item">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium group-hover/item:text-primary transition-colors">
                        Question Parsing
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Convert custom questions to clean format
                      </span>
                    </div>
                    <Switch
                      checked={watchedValues.enable_question_parsing}
                      onCheckedChange={(checked) =>
                        setValue("enable_question_parsing", checked)
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 bg-muted/30 border-t border-border flex justify-between items-center">
              {/* Active Status Toggle - Left Side */}
              <div className="flex items-center gap-3">
                <Label className="text-sm font-medium text-muted-foreground">Active</Label>
                <Switch
                  checked={watchedValues.is_active}
                  onCheckedChange={(checked) => setValue("is_active", checked)}
                />
              </div>

              {/* Action Buttons - Right Side */}
              <div className="flex gap-3 items-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  onClick={handleSubmit(onSubmit)}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 btn-smooth flex items-center gap-2"
                >
                  <span>{isSubmitting ? "Creating..." : "Create Endpoint"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="p-8 space-y-6">
              <Alert className="border-primary/20 bg-primary/5">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <AlertTitle className="text-base font-semibold">
                  Endpoint created successfully!
                </AlertTitle>
                <AlertDescription>
                  Your webhook endpoint is ready to receive enriched data.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground pl-1">
                    Your Webhook URL
                  </Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border shadow-inner">
                    <code className="flex-1 text-sm font-mono truncate">
                      https://calrouter.app/api/webhook/calendly/{createdEndpoint?.id || "xxxxx"}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(
                          `https://calrouter.app/api/webhook/calendly/${createdEndpoint?.id}`
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-accent/20 rounded-lg border border-border">
                  <p className="text-sm font-medium mb-2">Next Steps:</p>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Copy the webhook URL above</li>
                    <li>
                      <a
                        href="https://calendly.com/integrations/webhooks"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-mono text-xs"
                      >
                        Add this URL to Calendly
                      </a>
                    </li>
                    <li>Start receiving enriched booking data</li>
                  </ol>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleClose} className="w-full shadow-lg shadow-primary/25">
                  Done
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
