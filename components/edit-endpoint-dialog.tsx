"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// OPTIMIZATION: Direct icon imports to reduce bundle size
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Link2 from "lucide-react/dist/esm/icons/link-2";
import Zap from "lucide-react/dist/esm/icons/zap";
import Edit2 from "lucide-react/dist/esm/icons/edit-2";
import Save from "lucide-react/dist/esm/icons/save";
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

interface EditEndpointDialogProps {
  endpoint: {
    id: string;
    name: string;
    destination_url: string;
    enable_reschedule_detection: boolean;
    enable_utm_tracking: boolean;
    enable_question_parsing: boolean;
    is_active: boolean;
  };
  onSuccess?: (endpoint: any) => void;
  trigger?: React.ReactNode;
}

export function EditEndpointDialog({ endpoint, onSuccess, trigger }: EditEndpointDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const DIALOG_WIDTH = "640px";
  const DIALOG_MAX_HEIGHT = "85vh";

  const form = useForm<EndpointFormData>({
    resolver: zodResolver(endpointSchema),
    defaultValues: {
      name: endpoint.name,
      destination_url: endpoint.destination_url,
      enable_reschedule_detection: endpoint.enable_reschedule_detection,
      enable_utm_tracking: endpoint.enable_utm_tracking,
      enable_question_parsing: endpoint.enable_question_parsing,
      is_active: endpoint.is_active,
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

  // Reset form when endpoint changes
  useEffect(() => {
    reset({
      name: endpoint.name,
      destination_url: endpoint.destination_url,
      enable_reschedule_detection: endpoint.enable_reschedule_detection,
      enable_utm_tracking: endpoint.enable_utm_tracking,
      enable_question_parsing: endpoint.enable_question_parsing,
      is_active: endpoint.is_active,
    });
  }, [endpoint, reset]);

  const onSubmit = async (data: EndpointFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/endpoints/${endpoint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update endpoint");
      }

      const updatedEndpoint = await response.json();
      toast.success("Endpoint updated successfully!");
      onSuccess?.(updatedEndpoint);
      setOpen(false);
    } catch (error) {
      console.error("Error updating endpoint:", error);
      toast.error("Failed to update endpoint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="flex items-center gap-2">
            <Edit2 className="h-4 w-4" />
            <span>Edit</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="bg-card border-border shadow-2xl ring-1 ring-border/50 p-0 overflow-hidden flex flex-col"
        style={{
          maxWidth: DIALOG_WIDTH,
          width: '90vw',
          maxHeight: DIALOG_MAX_HEIGHT,
          height: 'auto'
        }}
      >
        {/* Modal Header */}
        <DialogHeader className="px-8 py-6 border-b border-border bg-muted/30">
          <DialogTitle className="text-xl font-bold tracking-tight">
            Edit Endpoint
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Update your webhook endpoint configuration.
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
              <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
