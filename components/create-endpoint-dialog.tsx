"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// OPTIMIZATION: Direct icon imports to reduce bundle size
import Plus from "lucide-react/dist/esm/icons/plus";
import Copy from "lucide-react/dist/esm/icons/copy";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Link2 from "lucide-react/dist/esm/icons/link-2";
import Zap from "lucide-react/dist/esm/icons/zap";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";;
import { endpointToasts, clipboardToasts } from "@/lib/toast-utils";
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
  enable_reschedule_detection: z.boolean(),
  enable_utm_tracking: z.boolean(),
  enable_question_parsing: z.boolean(),
  is_active: z.boolean(),
});

type EndpointFormData = z.infer<typeof endpointSchema>;

interface CreateEndpointDialogProps {
  onSuccess?: (endpoint: any) => void;
}

export function CreateEndpointDialog({ onSuccess }: CreateEndpointDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdEndpoint, setCreatedEndpoint] = useState<any>(null);

  // Simple width control - just change the number
  const DIALOG_WIDTH = 700; // Change this to make dialog wider/narrower

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
      endpointToasts.created();
      onSuccess?.(endpoint);

      // Don't close dialog yet - show success state first
    } catch (error) {
      console.error("Error creating endpoint:", error);
      const errorMessage = error instanceof Error ? error.message : undefined;
      endpointToasts.createFailed(errorMessage);
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
    clipboardToasts.copied('Webhook URL');
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
        className="bg-card border-border shadow-2xl ring-1 ring-border/50"
        style={{
          width: DIALOG_WIDTH,
          maxWidth: '95vw'
        }}
        showCloseButton={!createdEndpoint}
      >
        {!createdEndpoint ? (
          <>
            {/* Header */}
            <DialogHeader className="px-6 py-5 border-b border-border bg-muted/30">
              <DialogTitle className="text-xl font-bold">Create New Endpoint</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Configure a new destination for your incoming webhooks.
              </DialogDescription>
            </DialogHeader>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Endpoint Name */}
              <div>
                <Label className="text-[11px] font-bold uppercase text-muted-foreground">Endpoint Name</Label>
                <Input
                  {...register("name")}
                  placeholder="e.g. Production Listener"
                  className="mt-2"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Destination URL */}
              <div>
                <div className="flex justify-between items-center">
                  <Label className="text-[11px] font-bold uppercase text-muted-foreground">Destination URL</Label>
                  <button type="button" className="text-xs text-primary hover:underline">
                    <Zap className="h-3.5 w-3.5 inline mr-1" />
                    Test connection
                  </button>
                </div>
                <div className="relative mt-2">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register("destination_url")}
                    placeholder="https://"
                    className="pl-10 pr-10 font-mono text-sm"
                  />
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                </div>
                {errors.destination_url && (
                  <p className="text-sm text-destructive mt-1">{errors.destination_url.message}</p>
                )}
              </div>

              {/* Enrichment Features */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl">
                <div className="px-5 py-4 border-b border-primary/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-bold">Data Enrichment</h3>
                  </div>
                  <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase border border-primary/20">
                    Pro
                  </span>
                </div>

                <div className="p-3 space-y-1">
                  {/* Reschedule Detection */}
                  <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 cursor-pointer">
                    <div className="flex-1">
                      <span className="text-sm font-medium block">Reschedule Detection</span>
                      <span className="text-xs text-muted-foreground">Detect reschedules vs cancellations</span>
                    </div>
                    <Switch
                      checked={watchedValues.enable_reschedule_detection}
                      onCheckedChange={(checked) =>
                        setValue("enable_reschedule_detection", checked)
                      }
                    />
                  </label>

                  {/* UTM Tracking */}
                  <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 cursor-pointer">
                    <div className="flex-1">
                      <span className="text-sm font-medium block">UTM Tracking</span>
                      <span className="text-xs text-muted-foreground">Extract lead source data</span>
                    </div>
                    <Switch
                      checked={watchedValues.enable_utm_tracking}
                      onCheckedChange={(checked) =>
                        setValue("enable_utm_tracking", checked)
                      }
                    />
                  </label>

                  {/* Question Parsing */}
                  <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 cursor-pointer">
                    <div className="flex-1">
                      <span className="text-sm font-medium block">Question Parsing</span>
                      <span className="text-xs text-muted-foreground">Clean custom question format</span>
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

            {/* Footer */}
            <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Label className="text-sm font-medium text-muted-foreground">Active</Label>
                <Switch
                  checked={watchedValues.is_active}
                  onCheckedChange={(checked) => setValue("is_active", checked)}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  onClick={handleSubmit(onSubmit)}
                >
                  {isSubmitting ? "Creating..." : "Create Endpoint"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="p-6 md:p-8 space-y-5 md:space-y-6">
              <Alert className="border-primary/20 bg-primary/5">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <AlertTitle className="text-base font-semibold">
                  Endpoint created successfully!
                </AlertTitle>
                <AlertDescription className="text-sm">
                  Your webhook endpoint is ready to receive enriched data.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground pl-1">
                    Your Webhook URL
                  </Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border shadow-inner">
                    <code className="flex-1 text-xs md:text-sm font-mono truncate">
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
                      className="h-8 w-8 p-0 flex-shrink-0"
                      aria-label="Copy webhook URL"
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
                <Button onClick={handleClose} className="w-full shadow-lg shadow-primary/25 h-10 text-sm">
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
