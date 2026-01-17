"use client";

import { useState } from "react";
// OPTIMIZATION: Direct icon imports to reduce bundle size
import Trash2 from "lucide-react/dist/esm/icons/trash-2";;
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";

interface DeleteEndpointDialogProps {
  endpoint: {
    id: string;
    name: string;
  };
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function DeleteEndpointDialog({
  endpoint,
  onSuccess,
  trigger,
}: DeleteEndpointDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/endpoints/${endpoint.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete endpoint");
      }

      toast.success("Endpoint deleted successfully");
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error deleting endpoint:", error);
      toast.error("Failed to delete endpoint. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Endpoint?</AlertDialogTitle>
          <AlertDialogDescription>
            This will stop forwarding webhooks for "{endpoint.name}". Webhook
            logs will be preserved for your records.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Endpoint"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
